import React, { useEffect, useState } from 'react';
import SearchIcon from '../images/search-icon.png';
import Avatar from 'react-avatar';
import { auth } from '../firebase/setup';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import Location from '../images/location.png';
import DropDownIcon from '../images/drop-down-icon.png';
import LogoutIcon from '../images/logout-icon.png';
import ShoppingCartIcon from '../images/shopping-cart-icon.png';
import { useCart } from '../context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

interface cityProp {
    city?: string;
    onSearch?: (query: string) => void;
}

const Navbar = ({ city, onSearch }: cityProp) => {
    const [authStore, setAuthStore] = useState<any>({});
    const { cart, getTotalQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState(() => {
        return localStorage.getItem('location') || 'Location';
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthStore(user || {});
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (city) {
            setLocation(city);
            localStorage.setItem('location', city);
        }
        else {
            setLocation(localStorage.getItem('location') || 'Location');
        }
    }, [city]);

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged Out Successfully!');
            clearCart();
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error(err);
        }
        localStorage.clear();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLocation = e.target.value;
        setLocation(newLocation);
        localStorage.setItem('location', newLocation);
    };

    return (
        <>
            <ToastContainer />
            <div className='flex'>
                <Link to='/'><h1 className='text-3xl font-extrabold italic ml-20'>MealMingle</h1></Link>
                {auth.currentUser ? (<div className='ml-6 shadow-lg flex items-center border border-gray-300 w-6/12 rounded-lg p-3 h-12'>
                    <img src={Location} alt='Location Icon' className='w-7 h-7 ml-2' />
                    <input className="outline-none text-gray-900 text-sm block w-40 p-2.5" placeholder='Location' value={location} onChange={handleLocationChange} required />
                    <img src={DropDownIcon} alt='Drop Down Icon' className='w-5 h-5 ml-5' />
                    <div className='ml-3 text-gray-400'>|</div>
                    <img src={SearchIcon} alt='Search Icon' className='w-6 h-6 ml-5' />
                    <input className="outline-none text-gray-900 text-sm block w-96 p-2.5" placeholder="Search for Restaurant" value={searchQuery}
                        onChange={handleSearchChange} required />
                </div>) : (<div className='ml-6 shadow-lg flex items-center border border-gray-300 w-7/12 rounded-lg p-3 h-12'>
                    <img src={Location} alt='Location Icon' className='w-7 h-7 ml-2' />
                    <input className="outline-none text-gray-900 text-sm block w-40 p-2.5" placeholder='Location' value={location} onChange={handleLocationChange} required />
                    <img src={DropDownIcon} alt='Drop Down Icon' className='w-5 h-5 ml-5' />
                    <div className='ml-3 text-gray-400'>|</div>
                    <img src={SearchIcon} alt='Search Icon' className='w-6 h-6 ml-5' />
                    <input className="outline-none text-gray-900 text-sm block w-96 p-2.5" placeholder="Search for Restaurant" value={searchQuery}
                        onChange={handleSearchChange} required />
                </div>)}
                <div className='flex items-center'>
                    {authStore?.photoURL ? (
                        <img src={authStore?.photoURL} alt='User Pic' className='w-12 h-12 ml-5 rounded-full' />
                    ) : authStore?.displayName ? (
                        <Avatar name={authStore?.displayName} round={true} size='40' className='ml-72' />
                    ) : null}
                    <div className='ml-2'>
                        {authStore?.displayName ? authStore.displayName : authStore?.email ? authStore.email : ''}
                    </div>
                    {authStore?.phoneNumber && <div className="text-gray-600 text-lg">{authStore.phoneNumber}</div>}
                    {!auth.currentUser?.email && !auth.currentUser?.phoneNumber && (
                        <Link to='/login'>
                            <button
                                className={`px-4 py-2 rounded-md border bg-white text-black border-gray-300 shadow-md ml-10 cursor-pointer`}>
                                Login
                            </button>
                        </Link>
                    )}
                    {!auth.currentUser?.email && !auth.currentUser?.phoneNumber && (
                        <Link to='/signup'>
                            <button
                                className={`px-4 py-2 rounded-md border bg-white text-black border-gray-300 shadow-md ml-10 cursor-pointer`}>
                                Sign Up
                            </button>
                        </Link>
                    )}
                    {auth.currentUser && (
                        <Link to='/cart' className='relative'>
                            <img src={ShoppingCartIcon} alt='Shopping Cart Icon' className='ml-4 shadow-lg p-2 rounded-xl text-gray-600 cursor-pointer w-10 h-10' />
                            {getTotalQuantity() > 0 && (
                                <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full'>
                                    {getTotalQuantity()}
                                </span>
                            )}
                        </Link>
                    )}
                    {auth.currentUser && (
                        <Link to='/order-history' className='relative'>
                            <div className='ml-6 shadow-lg p-2 rounded-xl text-black cursor-pointer w-15 h-15'>My Orders</div>
                        </Link>
                    )}
                    {auth.currentUser && (
                        <img onClick={logout} src={LogoutIcon} alt='Logout Icon' className='ml-6 shadow-lg p-2 rounded-xl text-gray-600 cursor-pointer w-10 h-10' />
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;