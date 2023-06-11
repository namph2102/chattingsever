class handleSocketCall {
  socket;
  constructor(socket) {
    this.socket = socket;
    console.log("Có người tham gia room", socket.id);
  }
  listUser = [];
  addUser(idUser, idPeer) {
    if (idUser && idPeer) {
      if (this.listUser.some((user) => user.isUser == idUser)) {
        return "Tài khoản đã tồn tại";
      }
      this.socket.isUser = idUser;
      this.socket.idPeer = idPeer;
      this.listUser.push(idUser, idPeer);
    }
  }
  changeCall(idUser, idPeer) {
    const index = this.listUser.findIndex((user) => user.idUser == idUser);
    if (index > -1) {
      this.listUser[index].idPeer = idPeer;
      console.log("Đổi phỏng thành công");
    }
  }
  deleteUser(idUser) {
    const index = this.listUser.findIndex((user) => user.idUser == idUser);
    if (index > -1) {
      this.listUser.splice(index, 1);
      console.log("Xóa user thành công");
    }
  }
}
export default handleSocketCall;
