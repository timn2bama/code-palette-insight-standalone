import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const RechartsComponents = {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
};

export interface RechartsProviderProps {
  children: (components: typeof RechartsComponents) => React.ReactNode;
}

export const RechartsProvider = ({ children }: RechartsProviderProps) => {
  return <>{children(RechartsComponents)}</>;
};

export default RechartsProvider;
