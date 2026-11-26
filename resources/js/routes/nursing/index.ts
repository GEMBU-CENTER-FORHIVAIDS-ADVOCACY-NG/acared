import admissions from './admissions'
import wards from './wards'
import wardRounds from './ward-rounds'
import records from './records'

const nursing = {
    admissions: Object.assign(admissions, admissions),
    wards: Object.assign(wards, wards),
    wardRounds: Object.assign(wardRounds, wardRounds),
    records: Object.assign(records, records),
}

export default nursing