export interface Geo {
  lat: number;
  lng: number;
}

export interface Party {
  _id: string;
  name: string;
  type: string;
  geo: Geo;
  address?: string;
  attendees?: number;
  date?: Date;
}
