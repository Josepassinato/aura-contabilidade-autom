
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { databaseFormSchema, DatabaseFormValues } from "./types";

export function useDatabaseForm() {
  // Get stored values from localStorage if they exist
  const getStoredValues = (): DatabaseFormValues => {
    if (typeof window !== "undefined") {
      return {
        dbType: localStorage.getItem("db-type") || "postgres",
        host: localStorage.getItem("db-host") || "localhost",
        port: parseInt(localStorage.getItem("db-port") || "5432"),
        database: localStorage.getItem("db-name") || "contabil",
        username: localStorage.getItem("db-username") || "",
        password: localStorage.getItem("db-password") || "",
        ssl: localStorage.getItem("db-ssl") === "true",
      };
    }
    
    return {
      dbType: "postgres",
      host: "localhost",
      port: 5432,
      database: "contabil",
      username: "",
      password: "",
      ssl: true,
    };
  };

  const form = useForm<DatabaseFormValues>({
    resolver: zodResolver(databaseFormSchema),
    defaultValues: getStoredValues(),
  });

  const onSubmit = (data: DatabaseFormValues) => {
    // Store values in localStorage
    localStorage.setItem("db-type", data.dbType);
    localStorage.setItem("db-host", data.host);
    localStorage.setItem("db-port", data.port.toString());
    localStorage.setItem("db-name", data.database);
    localStorage.setItem("db-username", data.username);
    localStorage.setItem("db-password", data.password);
    localStorage.setItem("db-ssl", data.ssl.toString());

    toast({
      title: "Configuração salva",
      description: "As configurações do banco de dados foram atualizadas com sucesso.",
    });
  };

  return { form, onSubmit };
}
