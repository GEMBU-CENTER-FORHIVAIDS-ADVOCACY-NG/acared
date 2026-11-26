import users from './users'
import categories from './categories'
import patients from './patients'

const api = {
    users: Object.assign(users, users),
    categories: Object.assign(categories, categories),
    patients: Object.assign(patients, patients),
}

export default api