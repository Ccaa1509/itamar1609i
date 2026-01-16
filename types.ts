
export enum RoomType {
  LIVING_ROOM = 'LIVING_ROOM',
  KITCHEN = 'KITCHEN',
  OUTSIDE = 'OUTSIDE',
  BEDROOM = 'BEDROOM',
  BATHROOM = 'BATHROOM'
}

export interface PlayerState {
  currentRoom: RoomType;
  position: [number, number, number];
}

export type Controls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  crouch: boolean;
  cycle: boolean;
};
