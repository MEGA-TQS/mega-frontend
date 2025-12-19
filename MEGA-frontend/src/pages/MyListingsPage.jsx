import React, { useEffect, useState } from 'react';
import ItemService from '../services/ItemService';
import { useAuth } from '../context/AuthContext';

const MyListingsPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (user) {
            ItemService.getMyListings(user.id).then(data => {
                // Filter out items that are already "deleted" (inactive)
                const activeItems = data.filter(i => i.active === true); 
                setItems(activeItems);
            });
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            await ItemService.deleteItem(id); // Ensure this calls DELETE /api/items/{id}
            // Remove from UI immediately
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleUpdatePrice = async (id) => {
        const newPrice = prompt("Enter new price:");
        if (newPrice) {
            try {
                // 1. Send the update to the backend
                const updatedItem = await ItemService.updatePrice(id, newPrice, user.id);
                
                // 2. Update the UI locally without reloading
                setItems(prevItems => prevItems.map(item => 
                    item.id === id ? { ...item, pricePerDay: updatedItem.pricePerDay } : item
                ));

                alert("Price updated!");
                // REMOVED: window.location.reload(); 
            } catch(e) { 
                console.error(e);
                alert("Error updating price"); 
            }
        }
    };

    return (
        <div className="container">
            <h2>My Items</h2>
            {items.map(item => (
                <div key={item.id} className="card mb-3 p-3">
                    <div className="d-flex justify-content-between">
                        <h5>{item.name} - €{item.pricePerDay}</h5>
                        <div>
                            <button className="btn btn-sm btn-info me-2" onClick={() => handleUpdatePrice(item.id)}>Edit Price</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default MyListingsPage;