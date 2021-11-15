export default {
  namespaced: true,
  state: {
    // 是否打开登录提示框
    openUnLoginBox: false
  },
  actions: {
    async setOpenUnLoginBox ({ state, dispatch }, flag) {
      // store 赋值
      state.openUnLoginBox = flag
    }
  }
}
