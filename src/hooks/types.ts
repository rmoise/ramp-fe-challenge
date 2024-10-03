import { Employee, PaginatedResponse, Transaction } from "../utils/types"

type UseTypeBaseResult<TValue> = {
  data: TValue
  loading: boolean
  invalidateData: () => void
}

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>
}

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>
}

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null>
export type TransactionsByEmployeeResult = UseTypeBaseByIdResult<Transaction[] | null>

export type PaginatedTransactionsResult = {
  data: PaginatedResponse<Transaction[]> | null // The data from the API
  loading: boolean // Loading state
  fetchAll: () => Promise<void> // Method to fetch all transactions
  invalidateData: () => void // Method to invalidate current data
}
