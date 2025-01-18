'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hello`)
      .then(res => res.text())
      .then(setMessage);
  }, []);

  return <main className="p-4">{message}</main>;
}
