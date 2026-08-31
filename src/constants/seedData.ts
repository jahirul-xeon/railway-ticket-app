// ============================================================
// Reference data extracted from railway_ticket_management.sql
// (train_station, zone, train, carriage_class, train_carriage,
//  genders, payment_methods).
//
// This is written to Firestore once, by ensureSeedData() in
// services/api.ts, so the app has trains/stations to work with.
// ============================================================

export type Zone = { code: number; name: string };
export type Station = { code: number; name: string; zoneCode: number; zone: string };
export type CarriageClass = {
  carriageId: number;
  type: string;
  name: string;
  className: string; // maps to SQL `class` (AC CHAIR / 1st / 2nd ...)
  seatPerCoach: number;
  fare: number;
};
export type TrainClass = CarriageClass; // per-train fares equal the base fare here
export type Train = {
  code: number;
  name: string;
  startTime: string;
  endTime: string;
  startStationCode: number;
  endStationCode: number;
  fromStation: string;
  toStation: string;
  classes: TrainClass[];
};
export type Gender = { id: number; name: string };
export type PaymentMethod = { id: number; name: string };

export const ZONES: Zone[] = [
  { code: 101, name: 'EAST ZONE' },
  { code: 201, name: 'WEST ZONE' },
];

export const STATIONS: Station[] = [
  { code: 111, name: 'Kamalapur Railway Station', zoneCode: 101, zone: 'EAST ZONE' },
  { code: 112, name: 'Chittagong Railway Station', zoneCode: 101, zone: 'EAST ZONE' },
  { code: 113, name: 'Sylhet Railway Station', zoneCode: 101, zone: 'EAST ZONE' },
  { code: 114, name: 'Mymensingh Railway Station', zoneCode: 101, zone: 'EAST ZONE' },
  { code: 115, name: 'Rangpur Railway Station', zoneCode: 201, zone: 'WEST ZONE' },
  { code: 116, name: 'Khulna Railway Station', zoneCode: 201, zone: 'WEST ZONE' },
  { code: 117, name: 'Rajshahi Railway Station', zoneCode: 201, zone: 'WEST ZONE' },
  { code: 118, name: 'Faridpur Railway Station', zoneCode: 201, zone: 'WEST ZONE' },
];

// carriage_class table. `fare` is the base fare; each train uses these
// same values in train_carriage, so we reuse them directly.
export const CARRIAGE_CLASSES: CarriageClass[] = [
  { carriageId: 1, type: 'AC_B', name: 'AC Berth', className: 'AC CHAIR', seatPerCoach: 40, fare: 1541 },
  { carriageId: 2, type: 'AC_S', name: 'AC Seat', className: 'AC CHAIR', seatPerCoach: 40, fare: 1200 },
  { carriageId: 3, type: 'F_BERTH', name: 'First Class Berth', className: '1st', seatPerCoach: 40, fare: 1100 },
  { carriageId: 4, type: 'F_CHAIR', name: 'First Class Chair', className: '1st', seatPerCoach: 40, fare: 700 },
  { carriageId: 5, type: 'F_SEAT', name: 'First Class Seat', className: '1st', seatPerCoach: 40, fare: 700 },
  { carriageId: 6, type: 'SHOVAN', name: 'Shovan', className: '2nd', seatPerCoach: 40, fare: 460 },
  { carriageId: 7, type: 'SNIGDHA', name: 'Snigdha (AC Chair)', className: 'AC CHAIR', seatPerCoach: 40, fare: 1200 },
  { carriageId: 8, type: 'sulov', name: 'Sulov', className: '2nd', seatPerCoach: 40, fare: 285 },
  { carriageId: 9, type: 'S_CHAIR', name: 'Shovan Chair', className: '2nd', seatPerCoach: 40, fare: 490 },
];

const stationName = (code: number) =>
  STATIONS.find((s) => s.code === code)?.name ?? String(code);

// train table (train_code, name, start/end time, start/end station).
const RAW_TRAINS: Omit<Train, 'fromStation' | 'toStation' | 'classes'>[] = [
  { code: 701, name: 'Subarna Express', startTime: '7:00 AM', endTime: '11:55 AM', startStationCode: 112, endStationCode: 111 },
  { code: 702, name: 'Subarna Express', startTime: '4:30 PM', endTime: '9:55 PM', startStationCode: 111, endStationCode: 112 },
  { code: 703, name: 'Mahanagar Godhuly', startTime: '3:00 PM', endTime: '10:45 PM', startStationCode: 112, endStationCode: 111 },
  { code: 704, name: 'Mahanagar Probati', startTime: '7:40 AM', endTime: '1:35 PM', startStationCode: 111, endStationCode: 112 },
  { code: 705, name: 'Parabat Express', startTime: '6:30 AM', endTime: '1:00 PM', startStationCode: 111, endStationCode: 113 },
  { code: 706, name: 'Parabat Express', startTime: '4:00 PM', endTime: '10:40 PM', startStationCode: 113, endStationCode: 111 },
  { code: 707, name: 'Joyontika Express', startTime: '11:30 AM', endTime: '7:00 PM', startStationCode: 111, endStationCode: 113 },
  { code: 708, name: 'Joyontika Express', startTime: '12:00 PM', endTime: '7:40 PM', startStationCode: 113, endStationCode: 111 },
  { code: 709, name: 'Paharika Express', startTime: '7:00 AM', endTime: '3:55 PM', startStationCode: 112, endStationCode: 113 },
  { code: 710, name: 'Paharika Express', startTime: '10:00 AM', endTime: '6:55 PM', startStationCode: 113, endStationCode: 112 },
  { code: 711, name: 'Udayan Express', startTime: '9:00 PM', endTime: '5:55 AM', startStationCode: 112, endStationCode: 113 },
  { code: 712, name: 'Udayan Express', startTime: '10:00 PM', endTime: '5:55 AM', startStationCode: 113, endStationCode: 112 },
  { code: 713, name: 'Isha Khan Mail', startTime: '11:40 AM', endTime: '10:55 PM', startStationCode: 111, endStationCode: 114 },
  { code: 714, name: 'Isha Khan Mail', startTime: '1:50 PM', endTime: '12:15 AM', startStationCode: 114, endStationCode: 111 },
  { code: 715, name: 'Kopotakkho Express', startTime: '7:00 AM', endTime: '12:25 PM', startStationCode: 116, endStationCode: 117 },
  { code: 716, name: 'Kopotakkho Express', startTime: '2:30 PM', endTime: '8:25 PM', startStationCode: 117, endStationCode: 116 },
  { code: 717, name: 'Sundarban Express', startTime: '8:00 AM', endTime: '3:55 PM', startStationCode: 111, endStationCode: 116 },
  { code: 718, name: 'Sundarban Express', startTime: '9:45 PM', endTime: '5:15 AM', startStationCode: 116, endStationCode: 111 },
  { code: 719, name: 'Silkcity Express', startTime: '7:00 AM', endTime: '1:15 PM', startStationCode: 117, endStationCode: 111 },
  { code: 720, name: 'Silkcity Express', startTime: '2:00 PM', endTime: '10:00 PM', startStationCode: 111, endStationCode: 117 },
  { code: 721, name: 'Modhumati Express', startTime: '6:40 AM', endTime: '2:00 PM', startStationCode: 117, endStationCode: 111 },
  { code: 722, name: 'Modhumati Express', startTime: '3:00 PM', endTime: '10:55 PM', startStationCode: 111, endStationCode: 117 },
  { code: 723, name: 'Rangpur Express', startTime: '7:00 AM', endTime: '11:55 AM', startStationCode: 115, endStationCode: 111 },
  { code: 724, name: 'Rangpur Express', startTime: '3:00 PM', endTime: '9:00 PM', startStationCode: 111, endStationCode: 115 },
];

// Every train offers all 9 carriage classes (train_carriage in the SQL).
export const TRAINS: Train[] = RAW_TRAINS.map((t) => ({
  ...t,
  fromStation: stationName(t.startStationCode),
  toStation: stationName(t.endStationCode),
  classes: CARRIAGE_CLASSES.map((c) => ({ ...c })),
}));

export const GENDERS: Gender[] = [
  { id: 1, name: 'Male' },
  { id: 2, name: 'Female' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, name: 'Credit Card' },
  { id: 2, name: 'Debit Card' },
  { id: 3, name: 'Bkash' },
  { id: 4, name: 'Nagad' },
];

export const SEATS_PER_ROW = 8; // A1..A8, B1..B8 ... (matches seat_labels())

export function seatLabels(capacity: number): string[] {
  const labels: string[] = [];
  const rows = Math.ceil(capacity / SEATS_PER_ROW);
  for (let r = 0; r < rows; r++) {
    const letter = String.fromCharCode(65 + r);
    for (let n = 1; n <= SEATS_PER_ROW && labels.length < capacity; n++) {
      labels.push(`${letter}${n}`);
    }
  }
  return labels;
}
