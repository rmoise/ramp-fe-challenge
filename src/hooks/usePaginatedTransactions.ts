import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): {
  data: PaginatedResponse<Transaction[]> | null
  setData: React.Dispatch<React.SetStateAction<PaginatedResponse<Transaction[]> | null>>
  loading: boolean
  fetchAll: () => Promise<void>
  invalidateData: () => void
} {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const params: PaginatedRequestParams = {
      page: paginatedTransactions ? paginatedTransactions.nextPage ?? 0 : 0,
    }

    console.log("Fetching paginated transactions with params:", params)

    if (params.page === null) {
      console.warn("No more pages to fetch.")
      return
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      params
    )

    console.log("API Response for paginated transactions:", response)

    if (response) {
      setPaginatedTransactions((previousResponse) => {
        if (!response.data || !Array.isArray(response.data)) {
          console.warn("Received unexpected response structure:", response)
          return previousResponse
        }

        return {
          data: [...(previousResponse?.data || []), ...response.data],
          nextPage: response.nextPage !== undefined ? response.nextPage : null,
        }
      })
    } else {
      console.warn("No response received. Returning previous state.")
    }
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return {
    data: paginatedTransactions,
    setData: setPaginatedTransactions,
    loading,
    fetchAll,
    invalidateData,
  }
}
