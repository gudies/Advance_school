import { useMemo } from 'react';
import { useCanteen } from '../hooks/useCanteen';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data-display/StatCard';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { MealRecord } from '../../../types/canteen';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UtensilsCrossed, TrendingUp, ShoppingBag, PieChart } from 'lucide-react';

export default function CanteenDashboardPage() {
  const { sales, menuItems, canteenStats } = useCanteen();

  // Prepare chart data by menu item categories
  const chartData = useMemo(() => {
    const summary: Record<string, number> = { breakfast: 0, lunch: 0, snack: 0, drink: 0 };
    sales.forEach((s) => {
      const match = menuItems.find((m) => m.id === s.menuItemId);
      if (match) {
        summary[match.category] = (summary[match.category] || 0) + s.totalPrice;
      }
    });

    return [
      { category: 'Breakfast', revenue: summary.breakfast },
      { category: 'Lunch', revenue: summary.lunch },
      { category: 'Snacks', revenue: summary.snack },
      { category: 'Drinks', revenue: summary.drink }
    ];
  }, [sales, menuItems]);

  const columns: Column<MealRecord>[] = [
    {
      header: 'Receipt ID',
      accessorKey: 'id',
      sortable: true,
      cell: (item: MealRecord) => <span className="font-mono text-xs">{item.id}</span>
    },
    {
      header: 'Meal Ordered',
      accessorKey: 'menuItemId',
      sortable: true,
      cell: (item: MealRecord) => {
        const dish = menuItems.find((m) => m.id === item.menuItemId);
        return <span>{dish ? dish.name : 'Unknown Meal'}</span>;
      }
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      sortable: true
    },
    {
      header: 'Total Price',
      accessorKey: 'totalPrice',
      sortable: true,
      cell: (item: MealRecord) => `${CURRENCY_SYMBOL}${item.totalPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      sortable: true,
      cell: (item: MealRecord) => (
        <Badge variant={item.paymentMethod === 'prepaid' ? 'success' : 'primary'} className="capitalize">
          {item.paymentMethod}
        </Badge>
      )
    },
    {
      header: 'Date & Time',
      accessorKey: 'date',
      cell: (item: MealRecord) => new Date(item.date).toLocaleString('en-GB')
    }
  ];

  const breadcrumbs = [
    { label: 'Canteen Management' },
    { label: 'Dashboard' }
  ];

  return (
    <PageWrapper
      title="Canteen Dashboard"
      subtitle="Examine daily food sales, record cash/prepaid logs, and track popular dish listings."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Cafeteria Revenue"
            value={`${CURRENCY_SYMBOL}${canteenStats.totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="text-emerald-500" />}
            description="Sum of all cash & prepaid order values"
          />
          <StatCard
            title="Meals Served Today"
            value={`${canteenStats.totalOrders} Meals`}
            icon={<ShoppingBag className="text-indigo-500" />}
            description="Unique POS meal tickets logged"
          />
          <StatCard
            title="Top Selling Dish"
            value={canteenStats.topItem}
            icon={<UtensilsCrossed className="text-amber-500" />}
            description={`With ${canteenStats.maxQty} units ordered today`}
          />
        </div>

        {/* Chart and Recent sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="text-primary-500" size={18} />
                Revenue by Food Category
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis dataKey="category" className="text-[10px] text-slate-500" />
                    <YAxis className="text-[10px] text-slate-500" />
                    <Tooltip formatter={(value) => `${CURRENCY_SYMBOL}${value}`} />
                    <Bar dataKey="revenue" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Sales List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="text-indigo-500" size={18} />
                Recent Sales Transactions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <DataTable
                columns={columns}
                data={sales}
                searchPlaceholder="Search sales by receipt ID..."
                searchKey="id"
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
