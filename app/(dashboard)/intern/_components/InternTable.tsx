"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Chip, ChipProps } from "@nextui-org/chip";
import React, { Key, useMemo, useState } from "react";
import {
  EditIcon,
  DeleteIcon,
} from "@/app/(dashboard)/intern/_components/Icons";
import { Tooltip } from "@nextui-org/tooltip";
import { Pagination } from "@nextui-org/pagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/libs/config";
import { Spinner } from "@nextui-org/spinner";
import Link from "next/link";
import APIClient from "@/libs/api-client";
import { PaginationResponse, PaginationResponseSuccess } from "@/libs/types";

const statusColorMap: Record<string, ChipProps["color"]> = {
  Approved: "success",
  Rejected: "danger",
  Pending: "warning",
};

export type AccountTableProps = {
  selectedInterns: Set<string>;
  setSelectedInterns: (selectedInterns: Set<string>) => void;
};

type Candidate = {
  id: number;
  fullName: string;
  internPeriodViewModel: { name: string };
  doB: string;
  phoneNumber: string;
  personalEmail: string;
  cvUri: string;
  gpa: number;
  universityViewModel: { name: string };
  status: string;
};

const formatDateOfBirth = (dob: string) => {
  const date = new Date(dob);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const apiClient = new APIClient({
  onFulfilled: (response) => response,
  onRejected: (error) => {
    console.log(error.response.data);
  },
});

export default function InternsTable({
  selectedInterns,
  setSelectedInterns,
}: AccountTableProps) {
  const [pageIndex, setPageIndex] = useState(1);

  const pageSize = 5;

  const {
    data: candidateData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["candidates", pageIndex, pageSize],
    queryFn: async () => {
      const response = await apiClient.get<PaginationResponse<Candidate>>(
        apiEndpoints.candidate,
        {
          params: new URLSearchParams({
            PageIndex: pageIndex.toString(),
            PageSize: pageSize.toString(),
          }),
        },
      );

      if (response?.statusCode === "200") {
        const { data } = response as PaginationResponseSuccess<Candidate>;

        return {
          candidates: data.pagingData,
          pageIndex: data.pageIndex,
          totalPages: data.totalPages,
        };
      }
    },
  });

  const candidates = candidateData?.candidates || [];

  const deleteInternMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`${apiEndpoints.candidate}/${id}`, { method: "DELETE" }).then(
        (response) => response.json(),
      ),
    onError: (error) => console.error("Error:", error),
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this period?")) {
      deleteInternMutation.mutate(id);
    }
  };

  const columns = useMemo(
    () => [
      { key: "fullName", label: "FULL NAME" },
      { key: "group", label: "GROUP" },
      { key: "doB", label: "Date of birth" },
      { key: "phoneNumber", label: "PHONE" },
      { key: "personalEmail", label: "EMAIL" },
      { key: "cvUri", label: "CV" },
      { key: "gpa", label: "GPA" },
      { key: "universityId", label: "UNIVERSITY" },
      { key: "status", label: "STATUS" },
      { key: "actions", label: "ACTIONS" },
    ],
    [],
  );

  const renderCell = (candidate: Candidate, columnKey: Key) => {
    const cellValue = candidate[columnKey as keyof Candidate];

    switch (columnKey) {
      case "fullName":
        return <p className="text-xs">{candidate.fullName}</p>;
      case "group":
        return (
          <p className="text-xs">{candidate.internPeriodViewModel.name}</p>
        );
      case "doB":
        return <p className="text-xs"> {formatDateOfBirth(candidate.doB)}</p>;
      case "phoneNumber":
        return <p className="text-xs">{candidate.phoneNumber}</p>;
      case "personalEmail":
        return <p className="text-xs">{candidate.personalEmail}</p>;
      case "cvUri":
        return (
          <Link
            className="text-xs text-blue-500 underline"
            href={candidate.cvUri}
          >
            Link
          </Link>
        );
      case "gpa":
        return <p>{candidate.gpa}</p>;
      case "universityId":
        return <p className="text-xs">{candidate.universityViewModel.name}</p>;
      case "status":
        return (
          <Chip
            className="text-xs capitalize"
            color={statusColorMap[candidate.status]}
            size="sm"
            variant="flat"
          >
            {typeof cellValue === "object"
              ? JSON.stringify(cellValue)
              : cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Tooltip content="Edit">
              <span className="cursor-pointer text-xs active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip content="Delete">
              <button
                onClick={() => handleDelete(candidate.id)}
                className="cursor-pointer text-xs active:opacity-50"
              >
                <DeleteIcon />
              </button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  return (
    <div className="flex flex-col px-4">
      <Table
        selectionMode="multiple"
        className="w-full"
        onSelectionChange={(keys) => setSelectedInterns(keys as Set<string>)}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={candidates}>
          {(candidate: Candidate) => (
            <TableRow key={candidate.id}>
              {(colKey) => (
                <TableCell>{renderCell(candidate, colKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination
        className="m-4 flex justify-center"
        isCompact
        loop
        showControls
        total={candidateData?.totalPages ? Number(candidateData.totalPages) : 0}
        initialPage={pageIndex}
        onChange={(page) => {
          setPageIndex(page);
        }}
      />
    </div>
  );
}
