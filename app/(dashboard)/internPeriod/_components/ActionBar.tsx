"use client";
import { Button } from "@nextui-org/button";

import { FilterIcon } from "@/app/(dashboard)/intern/_components/Icons";

import { Input } from "@nextui-org/input";
import ImportExcelModal from "@/app/(dashboard)/intern/_components/ImportExcelModal";
import NewPeriodModalNext from "./NewPeriodModal_next";

// export type ActionBarProps = {
//   selectedInterns: any[];
// };

export default function ActionBar() {
  return (
    <div className="mb-5 mt-3 flex w-full items-center gap-2">
      <Input type="name" placeholder="Search by name, group, technology,..." />
      <div className="flex min-w-max gap-3">
        {/* <NewPeriodModal /> */}
        <NewPeriodModalNext />
        <ImportExcelModal />
        <Button color="default" size="md" variant="shadow">
          <FilterIcon />
          Filter
        </Button>{" "}
      </div>
    </div>
  );
}
