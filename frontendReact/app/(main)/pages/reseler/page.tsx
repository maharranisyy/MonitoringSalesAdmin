/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Interface untuk Reseller
interface Reseller {
    id?: string;
    name: string;
    birthdate: string; // Stored as string
    gender: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    status: string;
    user_sales_id: string;
    photo_profile: string | null;
}

const Reseller = () => {
    const emptyReseller: Reseller = {
        id: '',
        name:'',
        birthdate: '',
        gender: '',
        phone: '',
        address: '',
        latitude: 0,
        longitude: 0,
        status: 'unverified',
        user_sales_id: '',
        photo_profile: null,
    };

    const [resellers, setResellers] = useState<Reseller[]>([]);
    const [resellerDialog, setResellerDialog] = useState(false);
    const [deleteResellerDialog, setDeleteResellerDialog] = useState(false);
    const [reseller, setReseller] = useState<Reseller>({ ...emptyReseller });
    const [selectedResellers, setSelectedResellers] = useState<Reseller | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const toast = useRef<Toast>(null);
    const [base64, setBase64] = useState('');
    const [file, setFile] = useState('');
    const [salesList, setSalesList] = useState<{ id: string; name: string }[]>([]);


    const fetchResellers = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://192.168.200.48:8000/api/resellers', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data)
            setResellers(response.data);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch resellers',
                life: 3000,
            });
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

    const fetchSales = async () => {
      const token = localStorage.getItem('authToken');
      try {
          const response = await axios.get('http://192.168.200.48:8000/api/resellers', {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          setSalesList(response.data);
      } catch (error) {
          console.error('Failed to fetch sales:', error);
      }
  };
  
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            fetchResellers();
            fetchSales();
        }
    }, [isClient]);

    const saveReseller = async () => {
      // Validasi input
      if (!reseller.name || !reseller.birthdate || !reseller.gender || !reseller.phone || !reseller.address || !reseller.status || !reseller.latitude || !reseller.longitude) {
          toast.current?.show({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Please fill all required fields.',
              life: 3000,
          });
          return;
      }
  
      const token = localStorage.getItem('authToken');
      try {
          // Siapkan data sebagai JSON
          const payload = {
              name: reseller.name,
              birthdate: reseller.birthdate,
              gender: reseller.gender,
              phone: reseller.phone,
              address: reseller.address,
              status: reseller.status || 'unverified',
              user_sales_id: reseller.user_sales_id || '',
              profile_photo: base64 || null, // Jika Anda ingin mengirim base64 atau URL
              latitude: reseller.latitude,
              longitude: reseller.longitude,
          };
  
          const url = isEditMode
              ? `http://192.168.200.47:8000/api/resellers/${reseller.id}` // Endpoint untuk update
              : 'http://192.168.200.47:8000/api/resellers'; // Endpoint untuk create
          const method = isEditMode ? 'put' : 'post';
  
          console.log(payload);
  
          await axios({
              method,
              url,
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              data: JSON.stringify(payload), // Kirim data sebagai JSON
          });
  
          // Refresh data setelah berhasil menyimpan
          fetchResellers();
  
          toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: `Reseller successfully ${isEditMode ? 'updated' : 'created'}`,
              life: 3000,
          });
  
          // Reset state
          setReseller({ ...emptyReseller });
          setFile('');
          setResellerDialog(false);
      } catch (error) {
          console.error(error);
          toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save reseller. Please try again.',
              life: 3000,
          });
      }
  };
  

  const updateResellerStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('authToken');
    try {
        await axios.patch(
            `http://192.168.200.47:8000/api/resellers/${id}/status`,
            { status: newStatus },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Update status di state lokal
        setResellers((prevResellers) =>
            prevResellers.map((reseller) =>
                reseller.id === id ? { ...reseller, status: newStatus } : reseller
            )
        );

        toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Status updated successfully',
            life: 3000,
        });
    } catch (error) {
        console.error(error);
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status',
            life: 3000,
        });
    }
};


    const confirmDeleteReseller = (reseller: Reseller) => {
        setSelectedResellers(reseller);
        setDeleteResellerDialog(true);
    };

    const deleteReseller = async () => {
        const token = localStorage.getItem('authToken');
        try {
            await axios.delete(`http://192.168.200.48:8000/api/resellers/${selectedResellers?.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setResellers(resellers.filter((r) => r.id !== selectedResellers?.id));
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Reseller successfully deleted',
                life: 3000,
            });
            setDeleteResellerDialog(false);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete reseller',
                life: 3000,
            });
        }
    };

    const openNew = () => {
        setReseller({ ...emptyReseller });
        setIsEditMode(false);
        setResellerDialog(true);
    };

    const editReseller = (reseller: Reseller) => {
        setReseller({ ...reseller });
        setIsEditMode(true);
        setResellerDialog(true);
    };

    const hideDialog = () => {
        setResellerDialog(false);
    };

    const hideDeleteResellerDialog = () => {
        setDeleteResellerDialog(false);
    };

    const header = (
        <div className="flex justify-content-between">
            <h5 className="m-0">Kelola Data Reseller</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
    );

    const ViewLocationButton = (rowData: Reseller) => {
        const [visible, setVisible] = useState(false);
    
        if (rowData.latitude && rowData.longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${rowData.latitude},${rowData.longitude}`;
    
            const markerIcon = new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            const handleClick = () => {
                if (typeof window !== 'undefined') {
                    // Pastikan kode ini hanya dijalankan di browser
                    window.open(googleMapsUrl, '_blank');
                }}
    
            return (
                <>
                    <Button
            label="Buka Maps"
            icon="pi pi-external-link"
            className="p-button-primary"
            onClick={handleClick}
        />
                    <Dialog
                        header="Map"
                        visible={visible}
                        style={{ width: '90vw', maxWidth: '800px' }}
                        onHide={() => setVisible(false)}
                    >
                        <div style={{ height: '500px' }}>
                            <MapContainer
                                center={[rowData.latitude, rowData.longitude]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                                />
                                <Marker position={[rowData.latitude, rowData.longitude]} icon={markerIcon}>
                                    <Popup>Reseller Location</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <Button
                                label="Buka Maps"
                                icon="pi pi-external-link"
                                className="p-button-primary"
                                onClick={() => window.open(googleMapsUrl, '_blank')}
                            />
                        </div>
                    </Dialog>
                </>
            );
        }
        return <span>Not Set</span>;
    };
    

    if (!isClient) {
        return null;
    }

    return (
        <div className="crud-demo">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar
                    className="mb-4"
                    left={<Button label="New" icon="pi pi-plus" onClick={openNew} />}
                />
                <DataTable
                    value={resellers}
                    paginator
                    rows={10}
                    header={header}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                    emptyMessage="No resellers found."
                >
                    <Column field="name" header="Name" sortable />
                    <Column field="birthdate" header="Tanggal Lahir" sortable />
                    <Column field="gender" header="Jenis Kelamin" sortable />
                    <Column field="phone" header="Nomor Telepon" sortable />
                    <Column field="address" header="Alamat" sortable />
                    <Column field="profile_photo" header="Foto Profil" body={(rowData) => rowData.profile_photo && <img src={rowData.profile_photo} alt="Profile" width="50" height="50" />} />

                    <Column
                        field="user_sales_id"
                        header="Sales Name"
                        body={(rowData) => {
                      const sales = salesList.find((sales) => sales.id === rowData.user_sales_id);
                      return sales ? sales.name : 'Unknown';
                      }}sortable/>

                    <Column
                        header="Lokasi"
                        body={ViewLocationButton}
                        sortable={false}
                    />
                    <Column
                      header="Status"
                      body={(rowData) => (
                        <Dropdown
                          value={rowData.status}
                          options={[
                            { label: 'Verified', value: 'verified' },
                            { label: 'Unverified', value: 'unverified' }
                          ]}
                        onChange={(e) => updateResellerStatus(rowData.id, e.value)}
                        placeholder="Select a status"
                        />
                      )}
                        />
                    <Column
                        header="Actions"
                        body={(rowData) => (
                            <>
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-success mr-2"
                                    onClick={() => editReseller(rowData)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger"
                                    onClick={() => confirmDeleteReseller(rowData)}
                                />
                            </>
                        )}
                    />
                </DataTable>
            </div>

            <Dialog
              visible={resellerDialog}
                style={{ width: '450px' }}
                header="Data Reseller"
                modal
                footer={
        <>
            <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={saveReseller} />
        </>
    }
    onHide={hideDialog}
>
    <div className="p-fluid">
        <div className="field">
            <label htmlFor="name">Name</label>
            <InputText
                id="name"
                value={reseller.name}
                onChange={(e) => setReseller({ ...reseller, name: e.target.value })}
                required
            />
        </div>

        <div className="field">
            <label htmlFor="birthdate">Tanggal Lahir</label>
            <Calendar
                id="birthdate"
                value={reseller.birthdate ? new Date(reseller.birthdate) : null}
                onChange={(e) => {
                    if (e.value) {
                        const dateValue = e.value instanceof Date ? e.value : new Date(e.value);
                        const formattedDate = dateValue.toISOString().split('T')[0];
                        setReseller({ ...reseller, birthdate: formattedDate });
                    }
                }}
                dateFormat="yy-mm-dd"
                showIcon
            />
        </div>

        <div className="field">
            <label htmlFor="gender">Jenis Kelamin</label>
            <Dropdown
                id="gender"
                value={reseller.gender}
                options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                ]}
                onChange={(e) => setReseller({ ...reseller, gender: e.value })}
            />
        </div>

        <div className="field">
            <label htmlFor="phone">Phone</label>
            <InputText
                id="phone"
                value={reseller.phone}
                onChange={(e) => setReseller({ ...reseller, phone: e.target.value })}
            />
        </div>

        <div className="field">
            <label htmlFor="address">Address</label>
            <InputText
                id="address"
                value={reseller.address}
                onChange={(e) => setReseller({ ...reseller, address: e.target.value })}
            />
        </div>

        <div className="field">
            <label htmlFor="user_sales_id">User Sales ID</label>
            <Dropdown
              value={reseller.user_sales_id}
              options={salesList.map((sales) => ({ label: sales.name, value: sales.id }))}
              onChange={(e) => setReseller({ ...reseller, user_sales_id: e.value })}
              placeholder="Select Sales"
            />
        </div>

        <div className="field">
            <label htmlFor="latitude">Latitude</label>
            <InputText
                id="latitude"
                value={String(reseller.latitude)}
                onChange={(e) => setReseller({ ...reseller, latitude: parseFloat(e.target.value) })}
                type="number"
            />
        </div>

        <div className="field">
            <label htmlFor="longitude">Longitude</label>
            <InputText
                id="longitude"
                value={String(reseller.longitude)}
                onChange={(e) => setReseller({ ...reseller, longitude: parseFloat(e.target.value) })}
                type="number"
            />
        </div>

        <div className="field">
            <label htmlFor="profile_photo">Foto Profil</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
            {reseller.photo_profile && (
                <div>
                    <p>Base64 Preview:</p>
                    <img src={reseller.photo_profile} alt="Preview" style={{ maxWidth: '200px' }} />
                </div>
            )}
        </div>
    </div>
</Dialog>

            <Dialog
                visible={deleteResellerDialog}
                style={{ width: '450px' }}
                header="Confirm"
                modal
                footer={
                    <>
                        <Button label="No" icon="pi pi-times" onClick={hideDeleteResellerDialog} className="p-button-text" />
                        <Button label="Yes" icon="pi pi-check" onClick={deleteReseller} />
                    </>
                }
                onHide={hideDeleteResellerDialog}
            >
                <div className="confirm-dialog">Are you sure you want to delete this reseller?</div>
            </Dialog>
        </div>
    );
};

export default Reseller;