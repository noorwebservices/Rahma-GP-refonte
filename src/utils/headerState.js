import { reactive } from 'vue'

export const headerState = reactive({
  title: '',
  subtitle: '',
  routeFrom: '',
  countryFrom: '',
  flagFrom: '',
  routeTo: '',
  countryTo: '',
  flagTo: ''
})

export const setHeaderRoute = (data = {}) => {
  headerState.title = data.title || ''
  headerState.subtitle = data.subtitle || ''
  headerState.routeFrom = data.routeFrom || ''
  headerState.countryFrom = data.countryFrom || ''
  headerState.flagFrom = data.flagFrom || ''
  headerState.routeTo = data.routeTo || ''
  headerState.countryTo = data.countryTo || ''
  headerState.flagTo = data.flagTo || ''
}

export const clearHeaderRoute = () => {
  setHeaderRoute({})
}
