"use client";

import { fetchRespositories } from "../actions";
import { useInfiniteQuery } from "@tanstack/react-query";

// Hook to fetch repositories with infinite scrolling
export const useRepository = () => {

    return useInfiniteQuery(
        {
            queryKey: ['repositories'],
            queryFn: async ({pageParam = 1}) => {
                const data = await fetchRespositories(pageParam, 10);
                return data;
            },
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length === 10) {
                    return allPages.length + 1;
                } else {
                    return undefined;
                }
            },
            initialPageParam: 1,
        }
    )
}