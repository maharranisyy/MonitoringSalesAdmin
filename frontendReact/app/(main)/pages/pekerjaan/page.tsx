"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

type TaskPekerjaan = {
  id?: number;
  task: string;
  description: string;
  assigned_to: string;
  status: string;
  reseller_id?: number;
  user_sales_id?: number; // Tambahkan properti ini
  deadline: string;
  photo_url: string;
  reseller?: {
    id: number;
    name: string;
  };
  sales?: {
    id: number;
    name: string;
  };
};

const TaskPekerjaanTable = () => {
  const [tasks, setTasks] = useState<TaskPekerjaan[]>([]);
  const [task, setTask] = useState<TaskPekerjaan | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [taskDialog, setTaskDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);
  const [base64, setBase64] = useState('');
  const [resellers, setResellers] = useState<{ id: number; name: string }[]>([]);
  const [sales, setSalesList] = useState<{ id: string; name: string }[]>([]);
  


  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get('http://192.168.200.48:8000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchTasks();
    fetchResellers();
  fetchSales();
  }, []);

  const fetchSales = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get('http://192.168.200.48:8000/api/tasks', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setSalesList(response.data);
    } catch (error) {
        console.error('Failed to fetch sales:', error);
    }
};

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]; // Ambil file dari event
      if (selectedFile) {
          const reader = new FileReader(); // Buat FileReader untuk konversi ke base64
          reader.onload = () => {
              if (typeof reader.result === 'string') {
                  setBase64(reader.result); // Pastikan hanya string yang masuk ke state
              }
          };
          reader.readAsDataURL(selectedFile); // Konversi file ke base64
      } else {
          setBase64(''); // Reset base64 jika tidak ada file
      }
  };

const updateTaskStatus = async (task: TaskPekerjaan, newStatus: string) => {
  const token = localStorage.getItem("authToken");

  try {
    const response = await axios.put(
      `http://192.168.200.47:8000/api/tasks/${task.id}`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, status: response.data.task.status } : t
      )
    );

    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to update task status",
    });
  }
};


const fetchResellers = async () => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.get("http://192.168.200.48:8000/api/resellers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setResellers(response.data);
  } catch (error) {
    console.error("Error fetching resellers:", error);
  }
};
  
  // Open the dialog to create or edit a task
 // Open the dialog to create or edit a task
const openNew = () => {
  setTask({
    task: "",
    description: "",
    assigned_to: "reseller",
    status: "pending",
    deadline: "",
    photo_url: "",
    reseller_id: undefined, // Tambahkan properti reseller_id
    user_sales_id: undefined, // Tambahkan properti user_sales_id
  });
  setSubmitted(false);
  setTaskDialog(true);
};


  const hideDialog = () => {
    setSubmitted(false);
    setTaskDialog(false);
  };

  const saveTask = async () => {
    setSubmitted(true);
    if (!task?.task || !task?.reseller_id || !task?.user_sales_id || !task?.status) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill in the required fields",
      });
      return;
    }
  
    const token = localStorage.getItem("authToken");
  
    try {
      const response = await axios.post("http://192.168.200.48:8000/api/tasks", task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks([...tasks, response.data.task]);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Task added successfully",
      });
      setTaskDialog(false);
      setTask(null);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add task",
      });
    }
  };
  
  const editTask = (task: TaskPekerjaan) => {
    setTask({ ...task });
    setTaskDialog(true);
  };

  const deleteTask = (task: TaskPekerjaan) => {
    const token = localStorage.getItem("authToken");
    confirmDialog({
      message: `Are you sure you want to delete task "${task.task}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          // Send DELETE request to the API
          await axios.delete(`http://192.168.200.48:8000/api/tasks/${task.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Update state after successful deletion
          setTasks(tasks.filter((t) => t.id !== task.id));
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Task deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting task:", error);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete task",
          });
        }
      },
    });
  };

  const taskDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveTask} />
    </React.Fragment>
  );

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />
      <div className="card">
        <Toolbar
          className="mb-4"
          left={<Button label="New" icon="pi pi-plus" onClick={openNew} />}
        />
        <DataTable
          value={tasks}
          paginator
          rows={10}
          globalFilter={globalFilter}
          emptyMessage="No tasks found."
          header={
            <div className="table-header">
              <h5 className="m-0">Manage Tasks</h5>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGlobalFilter(e.target.value)
                  }
                  placeholder="Search..."
                />
              </span>
            </div>
          }
        >
            <Column
    field="sales.name"
    header="Nama Sales"
    body={(rowData) => rowData.sales?.name || "Tidak Ada"}
  />
          <Column field="task" header="Task" sortable />
          <Column field="description" header="Deskripsi" sortable />
          <Column
            field="reseller.name"
            header="Reseller"
            body={(rowData) => rowData.reseller?.name || "Not Assigned"}
          />
          <Column field="deadline" header="Deadline" sortable />

          <Column
  field="status"
  header="Status"
  body={(rowData) => (
    <div className={`status-badge status-${rowData.status}`}>
      <Dropdown
        value={rowData.status}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Completed", value: "completed" },
          { label: "Canceled", value: "canceled" },
        ]}
        onChange={(e) => updateTaskStatus(rowData, e.value)}
        placeholder="Select Status"
        className="status-dropdown"
      />
    </div>
    
  )}
/>

          <Column field="assigned_to" header="Menuju " />
          <Column field="photo_url" header="Foto" />
          <Column
            body={(rowData) => (
              <>
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-success mr-2"
                  onClick={() => editTask(rowData)}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger"
                  onClick={() => deleteTask(rowData)}
                />
              </>
            )}
            header="Actions"
          />
        </DataTable>
      </div>

      <Dialog
        visible={taskDialog}
        style={{ width: "450px" }}
        header="Task Details"
        modal
        className="p-fluid"
        footer={taskDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
  <label htmlFor="reseller">Reseller</label>
  <Dropdown
    id="reseller"
    value={task?.reseller_id}
    options={resellers.map((r) => ({ label: r.name, value: r.id }))}
    onChange={(e) => setTask({ ...task!, reseller_id: e.value })}
    placeholder="Select a Reseller"
  />
</div>
<div className="field">
  <label htmlFor="sales">Sales</label>
  <Dropdown
    id="sales"
    value={task?.user_sales_id}
    options={sales.map((s) => ({ label: s.name, value: s.id }))}
    onChange={(e) => setTask({ ...task!, user_sales_id: e.value })}
    placeholder="Select a Sales"
  />
</div>

        <div className="field">
          <label htmlFor="task">Task</label>
          <InputText
            id="task"
            value={task?.task || ""}
            onChange={(e) => setTask({ ...task!, task: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            rows={3}
            value={task?.description || ""}
            onChange={(e) =>
              setTask({ ...task!, description: e.target.value })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="deadline">Deadline</label>
          <InputText
            id="deadline"
            type="date"
            value={task?.deadline || ""}
            onChange={(e) => setTask({ ...task!, deadline: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={task?.status}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Completed", value: "completed" },
              { label: "Canceled", value: "canceled" },
            ]}
            onChange={(e) => setTask({ ...task!, status: e.value })}
            placeholder="Select a Status"
          />

<div className="field">
  <label htmlFor="photo">Upload Photo</label>
  <input
    type="file"
    id="photo"
    accept="image/*" // Hanya gambar yang bisa dipilih
    onChange={handleFileChange} // Fungsi untuk menangani file yang dipilih
  />
</div>
        </div>
      </Dialog>
    </div>
  );
};

export default TaskPekerjaanTable;
