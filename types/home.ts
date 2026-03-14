export type PostType = {
  ulid: string;
  location: {
    id: number;
    name: string;
    address: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
  rating: number;
  images: {
    order: number;
    image: string;
  }[];
  submitted_dt: string;
  price: string;
  temperature: string;
  head: string;
  creaminess: string;
  settling: string;
  gSplit?: boolean;
  caption: string;
  created_dt: string;
  created_by: string;
  updated_dt: string;
  updated_by: string;
};
