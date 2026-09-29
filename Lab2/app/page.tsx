'use client';

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./../firebase/firebase.config";

type Item = {
  id: string;
  inputText: string;
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  const fetchItems = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "items"));
    setItems(
      snapshot.docs.map((item) => ({
        id: item.id,
        inputText: item.data().inputText,
      })),
    );
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      await fetchItems();
    };

    void loadItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!inputText.trim()) return;

    await addDoc(collection(db, "items"), { inputText });
    setInputText("");
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    await deleteDoc(doc(db, "items", id));
    await fetchItems();
  };

  const handleEdit = async (id: string) => {
    const editValue = prompt("Enter the new value");
    if (!editValue) return;

    await updateDoc(doc(db, "items", id), { inputText: editValue });
    await fetchItems();
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-8 font-sans">
      <h1 className="text-3xl font-bold">NextJS Firebase</h1>
      <div className="flex gap-2">
        <input
          type="text"
          className="border-2 px-3 py-2"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
        />
        <button className="border p-2" onClick={handleAdd}>
          Agregar
        </button>
      </div>
      <ul className="w-full max-w-md space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <span>{item.inputText}</span>
            <div className="flex gap-2">
              <button
                className="cursor-pointer border bg-yellow-500 p-2 text-white"
                onClick={() => handleEdit(item.id)}
              >
                Edit
              </button>
              <button
                className="cursor-pointer border bg-red-500 p-2 text-white"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
