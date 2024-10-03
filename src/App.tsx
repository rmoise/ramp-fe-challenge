// src/App.tsx

import { Fragment, useCallback, useEffect, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, fetchAll: fetchEmployees, loading: employeesLoading } = useEmployees()

  const { data: paginatedTransactions, fetchAll: fetchPaginatedTransactions } =
    usePaginatedTransactions()

  const { data: transactionsByEmployee, fetchById: fetchTransactionsByEmployee } =
    useTransactionsByEmployee()

  const [transactionsMap, setTransactionsMap] = useState<Map<string, Transaction>>(new Map())
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [isAllEmployees, setIsAllEmployees] = useState(true)

  // Update transactionsMap when new data is fetched
  useEffect(() => {
    if (paginatedTransactions?.data) {
      setTransactionsMap((prevMap) => {
        const newMap = new Map(prevMap)
        paginatedTransactions.data.forEach((transaction) => {
          const existingTransaction = newMap.get(transaction.id)
          newMap.set(transaction.id, existingTransaction || transaction)
        })
        return newMap
      })
    }
  }, [paginatedTransactions])

  useEffect(() => {
    if (transactionsByEmployee) {
      setTransactionsMap((prevMap) => {
        const newMap = new Map(prevMap)
        transactionsByEmployee.forEach((transaction) => {
          const existingTransaction = newMap.get(transaction.id)
          newMap.set(transaction.id, existingTransaction || transaction)
        })
        return newMap
      })
    }
  }, [transactionsByEmployee])

  // Update selectedTransactions based on filter
  useEffect(() => {
    const allTransactions = Array.from(transactionsMap.values())
    if (isAllEmployees) {
      setSelectedTransactions(allTransactions)
    } else if (selectedEmployeeId) {
      setSelectedTransactions(
        allTransactions.filter((transaction) => transaction.employee.id === selectedEmployeeId)
      )
    } else {
      setSelectedTransactions([])
    }
  }, [transactionsMap, isAllEmployees, selectedEmployeeId])

  const updateTransaction = useCallback(
    (transactionId: string, approved: boolean) => {
      setTransactionsMap((prevMap) => {
        const newMap = new Map(prevMap)
        const transaction = newMap.get(transactionId)
        if (transaction) {
          newMap.set(transactionId, { ...transaction, approved })
        }
        return newMap
      })
    },
    [setTransactionsMap]
  )

  const loadEmployees = useCallback(async () => {
    console.log("Loading employees...")
    await fetchEmployees()
  }, [fetchEmployees])

  const loadAllTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    console.log("Loading all transactions...")
    await fetchPaginatedTransactions()
    setTransactionsLoading(false)
  }, [fetchPaginatedTransactions])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setTransactionsLoading(true)
      console.log(`Loading transactions for employee ID: ${employeeId}`)
      await fetchTransactionsByEmployee(employeeId)
      setTransactionsLoading(false)
    },
    [fetchTransactionsByEmployee]
  )

  useEffect(() => {
    const initialize = async () => {
      if (!employees && !employeesLoading) {
        await loadEmployees()
      }
      if (isAllEmployees && !paginatedTransactions?.data && !transactionsLoading) {
        await loadAllTransactions()
      }
    }
    initialize()
  }, [
    employees,
    employeesLoading,
    loadEmployees,
    isAllEmployees,
    paginatedTransactions,
    transactionsLoading,
    loadAllTransactions,
  ])

  const handleEmployeeChange = useCallback(
    async (newValue: Employee | null) => {
      console.log("handleEmployeeChange called with:", newValue)
      setSelectedEmployeeId(newValue?.id === "all-employees" ? null : newValue?.id || null)
      setIsAllEmployees(!newValue || newValue.id === "all-employees")

      // Reset transactions loading state
      setTransactionsLoading(true)
      setSelectedTransactions([])

      if (!newValue || newValue.id === "all-employees") {
        console.log("All Employees selected.")
        await loadAllTransactions()
      } else {
        console.log(`Fetching transactions for employee ID: ${newValue.id}`)
        await loadTransactionsByEmployee(newValue.id)
      }

      setTransactionsLoading(false)
    },
    [loadAllTransactions, loadTransactionsByEmployee]
  )

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />
        <hr className="RampBreak--l" />
        <InputSelect<Employee>
          isLoading={employeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees ? [EMPTY_EMPLOYEE, ...employees] : []}
          label="Filter by employee"
          loadingLabel="Loading employees..."
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={handleEmployeeChange}
        />
        <div className="RampBreak--l" />
        <div className="RampGrid">
          {transactionsLoading ? (
            <div>Loading transactions...</div>
          ) : (
            <Transactions transactions={selectedTransactions} updateTransaction={updateTransaction} />
          )}
          {isAllEmployees && paginatedTransactions?.nextPage && (
            <button
              className="RampButton"
              onClick={async () => {
                console.log("Loading more transactions...")
                await fetchPaginatedTransactions()
              }}
              disabled={transactionsLoading}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
