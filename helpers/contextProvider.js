import {createContext, useContext} from 'react';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export default DataContext;