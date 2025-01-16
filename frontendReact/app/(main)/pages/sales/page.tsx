"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

// Define the UserSales interface
interface UserSales {
  id: number;
  name: string;
  email: string;
  password?: string; // Password should not be exposed
  merk_hp: string;
  address: string;
  phone_number: string;
  kode_sales?: string; // Make kode_sales optional
  tanggal_lahir?: string; // Add birth date field
  gender?: string; // Add gender field
}

const Sales: React.FC = () => {
  const [users, setUsers] = useState<UserSales[]>([]);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSales | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const toast = useRef<Toast>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.200.48:8000/api';

  // Fetch user data from the Laravel API
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken'); // Ensure you use the correct token key
      try {
        console.log('testApi');

        const response = await axios.get('http://192.168.200.48:8000/api/users-sales', {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
    
        // Map API data to match frontend structure
        const mappedUsers = response.data.map((user: any) => ({
          ...user,
          phone_number: user.phone, // Map backend 'phone' to frontend 'phone_number'
          tanggal_lahir: user.birthdate, // Map backend 'birthdate' to frontend 'tanggal_lahir'
        }));
    
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user data.', life: 3000 });
      }
    };

    fetchUsers();
  }, [API_URL]);

  // Action column template
  const actionBodyTemplate = (rowData: UserSales) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success mr-2"
        onClick={() => editUser(rowData)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => confirmDeleteUser(rowData)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </>
  );

  // Edit user
  const editUser = (user: UserSales) => {
    setSelectedUser({ ...user }); // Data user akan otomatis diisi
    setIsNewUser(false);
    setEditDialogVisible(true);
  };  

  // Confirm delete user
  const confirmDeleteUser = (user: UserSales) => {
    confirmDialog({
      message: `Are you sure you want to delete user "${user.name}"?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteUser(user),
      reject: () => {}
    });
  };

  // Delete user
  const deleteUser = async (user: UserSales) => {
    const token = localStorage.getItem('authToken'); // Retrieve token
    try {
      await axios.delete(`http://192.168.200.48:8000/api/users-sales/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter(u => u.id !== user.id));
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User deleted successfully.', life: 3000 });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete user.', life: 3000 });
    }
  };

  // Save user (create or update)
  const saveUser = async () => {
    if (!selectedUser) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No user data provided.', life: 3000 });
      return;
    }
  
    const token = localStorage.getItem('authToken'); // Retrieve token
    if (!token) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unauthorized. Please log in again.', life: 3000 });
      return;
    }
  
    // Map frontend fields to backend fields
    const userData = {
      name: selectedUser.name,
      email: selectedUser.email,
      password: selectedUser.password,
      merk_hp: selectedUser.merk_hp,
      address: selectedUser.address,
      phone: selectedUser.phone_number, // Map phone_number -> phone
      birthdate: selectedUser.tanggal_lahir, // Map tanggal_lahir -> birthdate
      gender: selectedUser.gender,
    
    };
  
    console.log(userData); 

    try {
      if (isNewUser) {
        const response = await axios.post(`${API_URL}/users-sales`, userData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUsers([...users, response.data]);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User added successfully.', life: 3000 });
      } else {
        const response = await axios.put(`${API_URL}/users-sales/${selectedUser.id}`, userData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUsers(users.map((u) => (u.id === selectedUser.id ? response.data : u)));
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User updated successfully.', life: 3000 });
      }
  
      setEditDialogVisible(false);
      setSelectedUser(null);
    } catch (error) {
      handleApiError(error);
    }
  };
  


  // Function to handle API errors
  const handleApiError = (error: any) => {
    console.error('Error saving user:', error);
    const errorMessage = error.response?.data?.message || 'Failed to save user.';
    const errorDetails = error.response?.data || null;
    if (errorDetails) {
      const detailedMessages = Object.values(errorDetails).flat().join(' ');
      toast.current?.show({ severity: 'error', summary: 'Error', detail: detailedMessages, life: 3000 });
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditDialogVisible(false);
    setSelectedUser(null);
  };

  // Handle input changes
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement> | DropdownChangeEvent, field: keyof UserSales) => {
    if (selectedUser) {
        let value: any = 'value' in e ? e.value : e.target.value;
        // Validasi untuk tanggal
        if (field === 'tanggal_lahir' && value && isNaN(Date.parse(value))) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid date format.', life: 3000 });
            return;
        }

        setSelectedUser({ ...selectedUser, [field]: value });
    }
};


  // Open dialog to add a new user
  const openNewUser = () => {
    setSelectedUser({
      id: 0,
      name: '',
      email: '',
      password: '',
      merk_hp: '',
      address: '',
      phone_number: '',
      // Remove kode_sales as it will be auto-generated
  
      tanggal_lahir: '', // Default empty birth date
      gender: '', // Default empty gender
    });
    setIsNewUser(true);
    setEditDialogVisible(true);
  };

  return (
    <div className="p-m-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="card">
        <h2>Sales Data</h2>
        <Toolbar className="mb-4" left={() => (
          <>
            <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNewUser} />
          </>
          )} />
        <DataTable value={users} paginator rows={10} responsiveLayout="scroll" className="p-datatable-striped p-datatable-bordered">
          <Column field="name" header="Nama" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="merk_hp" header="Merk Hp" sortable />
          <Column field="address" header="Alamat" sortable />
          <Column field="phone" header="Nomor Telepon" sortable />
          {/* Conditionally render kode_sales column if it exists */}
          <Column field="kode_sales" header="Kode Sales" sortable />
          <Column field="birthdate" header="Tanggal Lahir" sortable />
          <Column field="gender" header="Jenis Kelamin" sortable />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>

        <Dialog
          visible={editDialogVisible}
          header={isNewUser ? "Add New User" : "Edit User"}
          modal
          className="p-fluid"
          footer={
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={cancelEdit} />
              <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={saveUser} />
            </>
          }
          onHide={cancelEdit}
        >
          {selectedUser && (
            <>
              <div className="p-field">
                <label htmlFor="name">Name</label>
                <InputText id="name" value={selectedUser.name} onChange={(e) => onInputChange(e, 'name')} required />
              </div>
              <div className="p-field">
                <label htmlFor="email">Email</label>
                <InputText id="email" value={selectedUser.email} onChange={(e) => onInputChange(e, 'email')} required />
              </div>
              {/* Show password field only for new users */}
              {isNewUser && (
                <div className="p-field">
                  <label htmlFor="password">Password22</label>
                  <InputText id="password" type="password" value={selectedUser.password} onChange={(e) => onInputChange(e, 'password')} required />
                </div>
              )}
              <div className="p-field">
                <label htmlFor="merk_hp">Phone Brand</label>
                <InputText id="merk_hp" value={selectedUser.merk_hp} onChange={(e) => onInputChange(e, 'merk_hp')} required />
              </div>
              <div className="p-field">
                <label htmlFor="address">Address</label>
                <InputText id="address" value={selectedUser.address} onChange={(e) => onInputChange(e, 'address')} required />
              </div>
              <div className="p-field">
  <label htmlFor="phone">Phone Number</label>
  <InputText
    id="phone"
    value={selectedUser?.phone_number || ''} // Pastikan phone_number digunakan
    onChange={(e) => onInputChange(e, 'phone_number')}
    required
  />
</div>
              {/* Conditionally render kode_sales input only when editing */}
              {!isNewUser && (
                <div className="p-field">
                  <label htmlFor="kode_sales">Sales Code</label>
                  <InputText id="kode_sales" value={selectedUser.kode_sales || ''} onChange={(e) => onInputChange(e, 'kode_sales')} disabled />
                  {/* Make it disabled to prevent editing if desired */}
                </div>
              )}
              <div className="p-field">
                <label htmlFor="tanggal_lahir">Birth Date</label>
                <InputText id="tanggal_lahir" type="date" value={selectedUser?.tanggal_lahir || ''} onChange={(e) => onInputChange(e, 'tanggal_lahir')}required/>
                </div>
              <div className="p-field">
                <label htmlFor="gender">Gender</label>
                <Dropdown
                  id="gender"
                  value={selectedUser.gender || ''}
                  options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' },
                  ]}
                  onChange={(e) => onInputChange(e, 'gender')}
                  required
                  placeholder="Select Gender"
                />

              </div>
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Sales;