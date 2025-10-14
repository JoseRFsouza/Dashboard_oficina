"use client";
import { Moon, Sun,} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import CsvUploadDialog from "@/modals/uploader/csvUpload";
import {SimuladorDataModal} from "@/modals/SimuladorDataModal";
import { useCSV } from "@/lib/useCSV";


const NavBar = () => {
  const { setTheme } = useTheme();
  const { resetCSV } = useCSV(); // 🔑 pega a função de reset

  return (
    <nav className="h-16 px-4 flex items-center justify-between bg-background border-b shadow-md">
      {/* LEFT */}
      
      
        <div className="flex items-center gap-2">
          <CsvUploadDialog onReset={resetCSV} />
          <SimuladorDataModal />
        </div>
      

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold text-base">
          DASHBOARD IFE REPAIR SHOP
        </Link>
         </div>
         <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        
       
      </div>
    </nav>
  );
};


export default NavBar;
