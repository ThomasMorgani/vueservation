import Vue from 'vue'
import Vuex from 'vuex'
import apiFunctions from '@/modules/api'
import filters from '@/modules/filters'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    catalogItems: [],
    catalogitemEditting: null, //category id ? set id,
    catalogitemFieldsEditting: [], //category id ? set id,
    catalogView: 'overview',
    categories: [],
    categoryEditting: null, //category id ? set id,
    content: {
      main: {
        height: 0,
        width: 0
      },
      test: 2
    },
    customFields: [],
    events: [],
    eventEditting: null,
    eventsFilterSearchbox: null,
    eventsFilterCategories: [],
    eventsFilterCategorySelect: [],
    eventsFilterDateRange: [],
    imagePreviewData: {},
    modalCatalogCustomfield: false,
    modalImageFullPreview: false,
    modalCatalogitemEdit: false,
    modalCatalogitemEditCustomfields: false,
    modalCategoryEdit: false,
    patrons: [],
    settings: [],
    snackbarData: {},
    snackbarSettings: {
      defaultColor: 'primary',
      'multi-line': true,
      position: 'bottom',
      timeout: 5000,
      vertical: true
    },
    snackbarState: false
  },
  getters: {
    categoriesDisplayed(state) {
      //actual category ids mapped from select array
      let catsDisplayed = []
      if (
        state.eventsFilterCategorySelect &&
        state.eventsFilterCategorySelect.length > 0
      ) {
        state.eventsFilterCategorySelect.forEach(cat =>
          catsDisplayed.push(state.categories[cat].id)
        )
      }
      return catsDisplayed
    },
    catalogItemsDisplayed(state, getters) {
      let catalogItems = state.catalogItems
      //filter out selected categories, if any
      if (getters.categoriesDisplayed.length > 0) {
        catalogItems = catalogItems.filter(catalogItem => {
          return getters.categoriesDisplayed.includes(catalogItem.category)
        })
      }
      return catalogItems
    },
    eventsDisplayed(state, getters) {
      // console.log(getters.categoriesDisplayed);
      let events = state.events
      if (getters.categoriesDisplayed.length > 0) {
        events = events.filter(event => {
          return getters.categoriesDisplayed.includes(event.itemCategory)
        })
      }
      return events
    }
  },
  mutations: {
    catalogitemAdd(state, data) {
      state.catalogItems.push(data)
    },
    catalogitemDelete(state, data) {
      Vue.delete(state.catalogItems, data)
    },
    catalogitemEditting(state, data) {
      state.catalogitemEditting = data
    },
    catalogitemEdittingSetValue(state, data) {
      //data : {key: value editting, data: value of item }
      state.catalogitemEditting[data.key] = data.data
    },
    catalogitemSetValue(state, data) {
      //data : {key: value editting, data: value of item }
      console.log(data)
      state.catalogItems[data.index][data.key] = data.data
    },
    catalogView(state, data) {
      state.catalogView = data
    },
    categoryAdd(state, data) {
      state.categories.push(data)
    },
    categoryDelete(state, data) {
      Vue.delete(state.categories, data)
    },
    categoryEditting(state, data) {
      state.categoryEditting = data
    },
    categoryUpdate(state, data) {
      //data expects: {key: state.category key, value: state.category value}
      Vue.set(state.categories, data.key, data.value)
    },
    customfieldsSetEditting(state, data) {
      //data expects: {key: state.category key, value: state.category value}
      state.catalogitemFieldsEditting = data
    },
    customfieldsAddField(state, field) {
      state.customFields.push(field)
    },
    eventsFilterCategorySelect(state, val) {
      state.eventsFilterCategorySelect = val
    },
    eventsFilterSearchbox(state, val) {
      state.eventsFilterSearchbox = val
    },
    eventsFilterDateRange(state, val) {
      state.eventsFilterDateRange = val
    },
    pushStateValue(state, data) {
      //data expects: {key: state key, value: state value}
      state[data.key].push(data.value)
    },
    setStateValue(state, data) {
      //data expects: {key: state key, value: state value}
      console.log(data)
      state[data.key] = data.value
    },
    toggleModalCatalogCustomfield(state, data) {
      state.modalCatalogCustomfield = data
    },
    toggleModalCatalogitemEdit(state, data) {
      state.modalCatalogitemEdit = data
    },
    toggleModalCatalogitemEditCustomfields(state, data) {
      state.modalCatalogitemEditCustomfields = data
    },
    toggleModalEditCategory(state, data) {
      state.modalCategoryEdit = data
    },
    toggleModalImageFullPreview(state, data) {
      state.modalImageFullPreview = data
    }
  },
  actions: {
    apiCall(context, data) {
      // console.log(data)
      return new Promise((resolve, reject) => {
        apiFunctions.callApi(data.endpoint, data.postData || null).then(
          response => {
            resolve(response)
          },
          error => {
            reject(error)
          }
        )
      })
    },
    apiPost(context, data) {
      console.log(data)
      return new Promise((resolve, reject) => {
        apiFunctions.postApi(data.endpoint, data.postData).then(
          response => {
            resolve(response)
          },
          error => {
            reject(error)
          }
        )
      })
    },
    initializeApp({ dispatch, commit }) {
      return new Promise((resolve, reject) => {
        dispatch('apiCall', {
          endpoint: `/initialize_page_data`
        })
          .then(data => {
            // console.log(data)
            if (data) {
              Object.keys(data).forEach(key => {
                commit('setStateValue', { key: key, value: data[key] })
              })
            }
          })
          .catch(err => {
            console.log(err)
            reject()
          })
          .then(() => {
            resolve()
          })
      })
    },
    catalogitemAdd({ commit }, data) {
      commit('catalogitemAdd', data)
    },
    catalogitemDelete({ commit, dispatch, state }, data) {
      return new Promise((resolve, reject) => {
        dispatch('apiCall', {
          endpoint: '/catalogItem_delete/' + data.id
        })
          .then(res => {
            console.log(res)
            if (res.status === 'success') {
              commit(
                'catalogitemDelete',
                state.catalogItems.findIndex(el => el.id === data.id)
              )
            }
            resolve(res)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
    },
    catalogitemSetValue({ commit, state }, data) {
      //data : {id: id of cat item, item: key of value updating, data: value of item}
      const ciIndex = state.catalogItems.findIndex(el => el.id === data.id)
      console.log(ciIndex)
      if (ciIndex > -1) {
        commit('catalogitemSetValue', { ...data, index: ciIndex })
      } else {
        return false
      }
    },
    catalogitemEditting({ commit }, data) {
      if (data) {
        commit('catalogitemEditting', data)
      } else {
        commit('catalogitemEditting', {
          abbreviation: null,
          categoryName: null,
          customFields: [],
          id: null,
          image_data: {
            id: '2',
            file_name: '458d8cab268259a7e676eadc42ec2c6d.gif',
            file_name_orig: 'eil2.gif',
            file_ext: '.gif',
            file_type: 'image/gif',
            file_size: '94.93',
            file_path: '/reservations/images/uploads/',
            height: '768',
            width: '844',
            date_added: '2020-01-14 12:03:35',
            src:
              'https://www.eipl.org/reservations/images/uploads/458d8cab268259a7e676eadc42ec2c6d.gif'
          },
          description: null,
          name: null,
          status: null
        })
      }
    },
    catalogitemEdittingSetValue({ commit }, data) {
      //data : item editting int, fields obj
      commit('catalogitemEdittingSetValue', data)
    },
    catalogitemEdittingcustomfieldsSetEditting({ commit }, data) {
      return new Promise(resolve => {
        commit('customfieldsSetEditting', data)
        resolve()
      })
    },
    categoryDelete({ commit, dispatch, state }, data) {
      return new Promise((resolve, reject) => {
        dispatch('apiCall', {
          endpoint: '/category_delete/' + data.id
        })
          .then(res => {
            console.log(res)
            if (res.status === 'success') {
              commit(
                'categoryDelete',
                state.categories.findIndex(el => el.id === data.id)
              )
              //Update any CI with deleted category with default category
              const defaultCat = filters.getObjectFromArray(
                state.settings,
                'name',
                'Default_Category',
                'setting'
              )
              state.catalogItems.forEach((ci, i) => {
                if (ci.category === data.id) {
                  commit('catalogitemSetValue', {
                    index: i,
                    key: 'category',
                    data: defaultCat
                  })
                }
              })
            }
            commit('setStateValue', { key: 'snackbarData', value: res })
            commit('setStateValue', { key: 'snackbarState', value: true })
            resolve(res)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
    },
    categoryEdit({ commit }, data) {
      commit('categoryEditting', data)
    },
    categoryEditSave({ commit, dispatch, state }, data) {
      // console.log('data', data)
      return new Promise((resolve, reject) => {
        dispatch('apiCall', {
          endpoint: '/category_edit',
          postData: data
        })
          .then(res => {
            console.log('res', res)
            if (res.status === 'success') {
              if (data.isNew) {
                data.id = res.data
                commit('categoryAdd', data)
              } else {
                const catKey = state.categories.findIndex(
                  el => el.id === data.id
                )
                commit('categoryUpdate', { key: catKey, value: data })
              }
            }
            console.log(res)
            resolve(res)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
    },
    customfieldsAddField({ commit }, data) {
      commit('customfieldsAddField', data)
    },
    settingsNew({ commit, dispatch }, data) {
      return new Promise((resolve, reject) => {
        dispatch('apiCall', {
          endpoint: '/settings_new',
          postData: data
        })
          .then(res => {
            console.log('res', res)
            if (res.status === 'success') {
              commit('pushStateValue', { key: 'settings', value: data })
            }
            console.log(res)
            resolve(res)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
    },
    setStateValue({ commit }, data) {
      console.log(data)
      if (data.isPush) {
        console.log('is push')
        commit('pushStateValue', { key: data.key, value: data.value })
      } else {
        commit('setStateValue', { key: data.key, value: data.value })
      }
    },
    toggleModalCatalogCustomfield({ commit, state }) {
      commit('toggleModalCatalogCustomfield', !state.modalCatalogCustomfield)
    },
    toggleModalCatalogitemEdit({ commit, state }) {
      commit('toggleModalCatalogitemEdit', !state.modalCatalogitemEdit)
    },
    toggleModalCatalogitemEditCustomfields({ commit, state }) {
      commit(
        'toggleModalCatalogitemEditCustomfields',
        !state.modalCatalogitemEditCustomfields
      )
    },
    toggleModalEditCategory({ commit, state }) {
      commit('toggleModalEditCategory', !state.modalCategoryEdit)
    },
    toggleModalImageFullPreview({ commit, state }) {
      commit('toggleModalImageFullPreview', !state.modalImageFullPreview)
    }
  },
  modules: {}
})
