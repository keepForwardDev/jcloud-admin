import request from '@/libs/request.js'

/**
 * 根据nameKey获取子级字典，只能获取一级
 * @param nameKey
 * @returns {Promise<AxiosResponse<T>>}
 */
export function getDictionaryListByKey (nameKey) {
  return request.get('/dictionary/selectList/' + nameKey)
}

/**
 * 根据nameKey 获取字典树
 * @param nameKey
 * @returns {Promise<AxiosResponse<T>>}
 */
export function getDictionaryTreeByKey (nameKey) {
  return request.get('/dictionary/treeNodeByNameKey/' + nameKey)
}

export async function uploadFile (params) {
  return request.postJson('/upload/singleFile', params)
}
