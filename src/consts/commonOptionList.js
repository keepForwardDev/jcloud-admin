export const sexList = [
  {
    label: '男',
    value: 1
  },
  {
    label: '女',
    value: 2
  }
]

export const whetherList = [
  {
    label: '是',
    value: 1
  },
  {
    label: '否',
    value: 0
  }
]

export const deletedList = [
  {
    label: '否',
    value: 0
  },
  {
    label: '是',
    value: 1
  }
]

export const statusList = [
  {
    label: '待审核',
    value: 0
  },
  {
    label: '已通过',
    value: 1
  },
  {
    label: '未通过',
    value: 2
  }
]

export const fileTypeMap = new Map([
  ['image/gif,image/jpg,image/jpeg,image/png', ['jpg', 'png']],
  ['.doc,.docx,.pdf,.zip,.rar,.pdf,.xls,.xlsx', ['doc', 'docx', 'pdf', 'zip', 'rar', 'pdf','xls','xlsx']],
  ['.pdf,.zip,.rar', ['pdf', 'zip', 'rar']],
  ['image/gif,image/jpg,image/jpeg,image/png,.pdf', ['jpg', 'png', 'pdf']],
  ['.doc,.docx,.pdf', ['doc', 'docx', 'pdf']]
])
