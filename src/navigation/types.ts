import type { Train, TrainClass } from '@/constants/seedData';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  Results: {
    fromCode: number;
    toCode: number;
    fromName: string;
    toName: string;
    date: string; // YYYY-MM-DD
  };
  Seats: {
    train: Train;
    carriage: TrainClass;
    date: string;
  };
  Passenger: {
    train: Train;
    carriage: TrainClass;
    date: string;
    seats: string[];
  };
  Confirmation: {
    bookingId: string;
    trainName: string;
    fromStation: string;
    toStation: string;
    date: string;
    className: string;
    seats: string[];
    totalFare: number;
    passengerName: string;
  };
  Developers: undefined;
};

export type TabsParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};
