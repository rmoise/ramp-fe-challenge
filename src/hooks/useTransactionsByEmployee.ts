import { useCallback, useState } from "react"
import { Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult & {
  setData: React.Dispatch<React.SetStateAction<Transaction[] | null>>
} {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      if (!employeeId || employeeId === "all-employees") return

      const data = await fetchWithCache<Transaction[], { employeeId: string }>(
        "transactionsByEmployee",
        { employeeId }
      )

      if (data) {
        setTransactionsByEmployee(data)
      }
    },
    [fetchWithCache]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  return {
    data: transactionsByEmployee,
    setData: setTransactionsByEmployee,
    loading,
    fetchById,
    invalidateData,
  }
}
