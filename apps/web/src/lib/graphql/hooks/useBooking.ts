'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from 'urql';

const GetMyBookingsDocument = `
  query GetMyBookings($status: BookingStatus) {
    myBookings(status: $status) {
      edges {
        node {
          id
          number
          status
          period {
            startDate
            endDate
          }
          totalAmount
          depositAmount
          createdAt
        }
      }
      totalCount
    }
  }
`;

const CreateBookingDocument = `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      success
      booking {
        id
        number
        status
        totalAmount
        depositAmount
      }
      errors {
        field
        message
      }
    }
  }
`;

const CancelBookingDocument = `
  mutation CancelBooking($id: ID!, $reason: String!) {
    cancelBooking(id: $id, reason: $reason) {
      success
      booking {
        id
        status
      }
      errors {
        message
      }
    }
  }
`;

export function useBookings(status?: string) {
  const [result, refetch] = useQuery({
    query: GetMyBookingsDocument,
    variables: { status },
  });

  return {
    bookings: result.data?.myBookings?.edges?.map((edge: { node: unknown }) => edge.node) || [],
    totalCount: result.data?.myBookings?.totalCount || 0,
    isLoading: result.fetching,
    error: result.error,
    refetch,
  };
}

export function useCreateBooking() {
  const [result, executeMutation] = useMutation(CreateBookingDocument);

  const createBooking = useCallback(
    async (input: {
      pickupLocationId: string;
      startDate: string;
      endDate: string;
      equipmentItems: { equipmentInstanceId: string; quantity: number }[];
    }) => {
      const result = await executeMutation({ input });

      if (result.data?.createBooking?.success) {
        return result.data.createBooking.booking;
      }

      const errorMessage =
        result.data?.createBooking?.errors?.[0]?.message ||
        result.error?.message ||
        'Failed to create booking';

      throw new Error(errorMessage);
    },
    [executeMutation],
  );

  return {
    createBooking,
    isLoading: result.fetching,
    error: result.error,
  };
}

export function useCancelBooking() {
  const [result, executeMutation] = useMutation(CancelBookingDocument);

  const cancelBooking = useCallback(
    async (id: string, reason: string) => {
      const result = await executeMutation({ id, reason });

      if (result.data?.cancelBooking?.success) {
        return result.data.cancelBooking.booking;
      }

      const errorMessage =
        result.data?.cancelBooking?.errors?.[0]?.message ||
        result.error?.message ||
        'Failed to cancel booking';

      throw new Error(errorMessage);
    },
    [executeMutation],
  );

  return {
    cancelBooking,
    isLoading: result.fetching,
    error: result.error,
  };
}
