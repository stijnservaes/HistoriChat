export const chatRooms = [
  {
    name: "Victorian Era",
    id: 1,
  },
  {
    name: "Shakespearian Era",
    id: 2,
  },
  {
    name: "Roman Era",
    id: 3,
  },
];

export function roomExists(roomId: number) {
  return chatRooms.some((room) => room.id === roomId);
}
