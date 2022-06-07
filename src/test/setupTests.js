

import "@testing-library/jest-dom"
import { act } from "@testing-library/react"
import storage from '../state/storage'

afterEach(()=>{

    storage.clear()
})