// ============================================================
// Firestore data layer — the mobile equivalent of the PHP endpoints:
//   stations.php     -> getStations()
//   search_trains.php -> searchTrains()
//   seats.php        -> getSeats()
//   book_ticket.php  -> createBooking()   (atomic, like the PHP transaction)
//   my_bookings.php  -> getMyBookings()
//   (+ cancel, like the web app's cancel action)
// ============================================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  STATIONS,
  TRAINS,
  GENDERS,
  PAYMENT_METHODS,
  CARRIAGE_CLASSES,
  seatLabels,
  type Station,
  type Train,
  type TrainClass,
} from '@/constants/seedData';
import { DEMO_DEVELOPERS, type Member } from '@/constants/team';

const SEED_VERSION = 2;

// ---------- Seeding ----------
// Writes stations, trains and demo developers to Firestore once.
// Safe to call on every launch (only runs when the flag is behind).
export async function ensureSeedData(): Promise<void> {
  const flagRef = doc(db, 'meta', 'seed');
  const flag = await getDoc(flagRef);
  if (flag.exists() && flag.data()?.version >= SEED_VERSION) return;

  const batch = writeBatch(db);
  STATIONS.forEach((s) => batch.set(doc(db, 'stations', String(s.code)), s));
  TRAINS.forEach((t) => batch.set(doc(db, 'trains', String(t.code)), t));
  DEMO_DEVELOPERS.forEach((m, i) =>
    batch.set(doc(db, 'developers', String(i + 1)), { ...m, order: i + 1 })
  );
  batch.set(flagRef, { version: SEED_VERSION, seededAt: serverTimestamp() });
  await batch.commit();
}

// ---------- Developers ----------
// Loaded from the `developers` collection (edit these in the Firebase console).
export async function getDevelopers(): Promise<Member[]> {
  const snap = await getDocs(collection(db, 'developers'));
  const rows = snap.docs.map((d) => d.data() as Member & { order?: number });
  if (!rows.length) return DEMO_DEVELOPERS;
  rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return rows;
}

// ---------- Lookups ----------
export async function getStations(): Promise<Station[]> {
  const snap = await getDocs(collection(db, 'stations'));
  const rows = snap.docs.map((d) => d.data() as Station);
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows.length ? rows : STATIONS;
}

export const getGenders = () => GENDERS;
export const getPaymentMethods = () => PAYMENT_METHODS;

// ---------- Search ----------
// search_trains.php: trains where start_station == from && end_station == to.
export async function searchTrains(
  fromCode: number,
  toCode: number
): Promise<Train[]> {
  const snap = await getDocs(collection(db, 'trains'));
  const all = snap.docs.map((d) => d.data() as Train);
  const source = all.length ? all : TRAINS;
  return source
    .filter((t) => t.startStationCode === fromCode && t.endStationCode === toCode)
    .sort((a, b) => a.code - b.code);
}

// ---------- Seat map ----------
export type SeatCell = { seat: string; booked: boolean };

function slotKey(trainCode: number, carriageId: number, date: string) {
  return `${trainCode}_${carriageId}_${date}`;
}

export async function getSeats(
  trainCode: number,
  carriageId: number,
  date: string
): Promise<{ totalSeats: number; seats: SeatCell[]; freeCount: number }> {
  const cc =
    CARRIAGE_CLASSES.find((c) => c.carriageId === carriageId)?.seatPerCoach ?? 40;

  // Single-field equality query -> no composite index required.
  const q = query(
    collection(db, 'seatReservations'),
    where('slot', '==', slotKey(trainCode, carriageId, date))
  );
  const snap = await getDocs(q);
  const taken = new Set(
    snap.docs
      .map((d) => d.data() as { seat: string; active: boolean })
      .filter((r) => r.active)
      .map((r) => r.seat)
  );

  const seats = seatLabels(cc).map((seat) => ({ seat, booked: taken.has(seat) }));
  return { totalSeats: cc, seats, freeCount: seats.filter((s) => !s.booked).length };
}

// ---------- Booking ----------
export type BookingInput = {
  userId: string;
  train: Train;
  carriage: TrainClass;
  journeyDate: string; // YYYY-MM-DD
  seats: string[];
  passengerName: string;
  passengerAge: number;
  genderId: number;
  paymentMethodId: number;
};

export type BookingResult = {
  bookingId: string;
  totalFare: number;
  seats: string[];
};

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const {
    userId,
    train,
    carriage,
    journeyDate,
    seats,
    passengerName,
    passengerAge,
    genderId,
    paymentMethodId,
  } = input;

  if (!seats.length) throw new Error('Select at least one seat.');

  const farePerSeat = carriage.fare;
  const totalFare = farePerSeat * seats.length;
  const genderName =
    GENDERS.find((g) => g.id === genderId)?.name ?? 'Not specified';
  const methodName =
    PAYMENT_METHODS.find((m) => m.id === paymentMethodId)?.name ?? 'Unknown';

  const slot = slotKey(train.code, carriage.carriageId, journeyDate);
  const bookingRef = doc(collection(db, 'bookings'));

  await runTransaction(db, async (tx) => {
    // Re-check every seat inside the transaction so two phones cannot
    // grab the same seat at once (same guard as book_ticket.php).
    const seatRefs = seats.map((s) =>
      doc(db, 'seatReservations', `${slot}_${s}`)
    );
    const seatSnaps = await Promise.all(seatRefs.map((r) => tx.get(r)));
    seatSnaps.forEach((snap, i) => {
      if (snap.exists() && snap.data()?.active) {
        throw new Error(`Seat ${seats[i]} was just taken. Please pick another.`);
      }
    });

    tx.set(bookingRef, {
      bookingId: bookingRef.id,
      userId,
      trainCode: train.code,
      trainName: train.name,
      fromStation: train.fromStation,
      toStation: train.toStation,
      startTime: train.startTime,
      endTime: train.endTime,
      travelDate: journeyDate,
      carriageId: carriage.carriageId,
      className: carriage.name,
      classType: carriage.className,
      seats,
      farePerSeat,
      totalFare,
      passengerName,
      passengerAge,
      genderId,
      genderName,
      paymentMethodId,
      paymentMethodName: methodName,
      status: 'Booked', // booking_status 1 = Booked
      paymentStatus: 'Completed', // payment_status 2 = Completed (mock gateway)
      bookingTimeMs: Date.now(),
      createdAt: serverTimestamp(),
    });

    seatRefs.forEach((ref, i) => {
      tx.set(ref, {
        slot,
        bookingId: bookingRef.id,
        trainCode: train.code,
        carriageId: carriage.carriageId,
        journeyDate,
        seat: seats[i],
        active: true,
      });
    });
  });

  return { bookingId: bookingRef.id, totalFare, seats };
}

// ---------- My bookings ----------
export type Booking = {
  bookingId: string;
  userId: string;
  trainCode: number;
  trainName: string;
  fromStation: string;
  toStation: string;
  startTime: string;
  endTime: string;
  travelDate: string;
  carriageId: number;
  className: string;
  classType: string;
  seats: string[];
  farePerSeat: number;
  totalFare: number;
  passengerName: string;
  passengerAge: number;
  genderName: string;
  paymentMethodName: string;
  status: 'Booked' | 'Cancelled' | 'Completed';
  paymentStatus: string;
  bookingTimeMs: number;
};

export async function getMyBookings(userId: string): Promise<Booking[]> {
  // Single equality filter (no orderBy) -> no composite index needed;
  // we sort newest-first on the client.
  const q = query(collection(db, 'bookings'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => d.data() as Booking);
  rows.sort((a, b) => (b.bookingTimeMs ?? 0) - (a.bookingTimeMs ?? 0));
  return rows;
}

export async function cancelBooking(booking: Booking): Promise<void> {
  const slot = slotKey(booking.trainCode, booking.carriageId, booking.travelDate);
  await runTransaction(db, async (tx) => {
    const bRef = doc(db, 'bookings', booking.bookingId);
    tx.update(bRef, { status: 'Cancelled' });
    booking.seats.forEach((s) => {
      tx.set(
        doc(db, 'seatReservations', `${slot}_${s}`),
        { active: false },
        { merge: true }
      );
    });
  });
}
