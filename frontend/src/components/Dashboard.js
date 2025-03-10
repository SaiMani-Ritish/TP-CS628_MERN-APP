import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState(0);
    const [monthlyData, setMonthlyData] = useState({});

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch expenses
                const expenseData = await expenseService.getAllExpenses();
                setExpenses(expenseData);

                // Fetch budget data for income
                const budgetData = await budgetService.getBudget();
                if (budgetData.data && budgetData.data.income) {
                    setIncome(budgetData.data.income);
                }

                // Process expenses by category and track unique months
                const categoryExpenses = {};
                const uniqueMonths = new Set();
                expenseData.forEach(expense => {
                    // Track unique months
                    const date = new Date(expense.date);
                    const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
                    uniqueMonths.add(monthYear);

                    // Track category expenses
                    if (!categoryExpenses[expense.category]) {
                        categoryExpenses[expense.category] = 0;
                    }
                    categoryExpenses[expense.category] += expense.amount;
                });

                const totalExpenses = Object.values(categoryExpenses).reduce((sum, amount) => sum + amount, 0);
                const numberOfMonths = Math.max(uniqueMonths.size, 1); // Use at least 1 month

                setMonthlyData({ 
                    totalExpenses,
                    categoryExpenses,
                    numberOfMonths
                });

            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    const barChartData = Object.entries(monthlyData.categoryExpenses || {}).map(([category, amount]) => ({
        name: category,
        amount: amount
    }));

    const monthlyIncome = income;
    const totalMonthlyExpenses = monthlyData.totalExpenses || 0;
    const numberOfMonths = monthlyData.numberOfMonths || 1;
    const totalPotentialIncome = monthlyIncome * numberOfMonths;
    const totalMonthlySavings = totalPotentialIncome - totalMonthlyExpenses;

    const budgetData = [
        { name: 'Total Monthly Expenses', value: totalMonthlyExpenses },
        { name: 'Total Monthly Savings', value: totalMonthlySavings }
    ];

    const allData = [
        { name: 'Total Potential Income', value: totalPotentialIncome },
        { name: 'Total Monthly Expenses', value: totalMonthlyExpenses },
        { name: 'Total Monthly Savings', value: totalMonthlySavings }
    ];

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            {expenses.length > 0 ? (
                <>
                    <div className="charts-container">
                        <div className="chart-container">
                            <h3>Expense Categories</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                    data={barChartData} 
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    animationDuration={1000}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Bar 
                                        dataKey="amount" 
                                        fill="#82ca9d" 
                                        barSize={50}
                                        animationBegin={0}
                                        animationDuration={1000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-container">
                            <h3>Budget Overview</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={budgetData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1000}
                                    >
                                        {budgetData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.name === 'Total Monthly Expenses' ? COLORS[1] : COLORS[2]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend 
                                        payload={allData.map((item, index) => ({
                                            id: item.name,
                                            type: 'square',
                                            value: `${item.name}: $${item.value.toFixed(2)}`,
                                            color: COLORS[index]
                                        }))}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                <p>No Expenses Found</p>
            )}
        </div>
    );
};

export default Dashboard;
