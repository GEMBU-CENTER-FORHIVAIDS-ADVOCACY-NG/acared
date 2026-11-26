import wardRounds from './ward-rounds'
import admissions from './admissions'

const consultant = {
    wardRounds: Object.assign(wardRounds, wardRounds),
    admissions: Object.assign(admissions, admissions),
}

export default consultant