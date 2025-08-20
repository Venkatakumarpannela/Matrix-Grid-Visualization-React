import React, { useState, useEffect, useRef } from 'react';

// The main App component that renders the entire application.
const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans antialiased flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Matrix Grid Visualization</h1>
        <p className="text-gray-600">A demonstration of HTML Canvas and React for dynamic data visualization.</p>
      </header>
      <MatrixGrid />
    </div>
  );
};

// The MatrixGrid component handles the core logic and rendering of the grid.
const MatrixGrid = () => {
  const canvasRef = useRef(null);
  const [gridData, setGridData] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cellSize = 50; // Size of each cell in pixels
  const gap = 2; // Gap between cells
  const rows = 10;
  const cols = 10;

  // Simulate a mock API call to fetch grid data.
  const fetchGridData = async () => {
    try {
      setLoading(true);
      // Simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data in a JSON structure, similar to a REST API response.
      const mockApiData = {
        data: Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: cols }, (_, colIndex) => ({
            id: `${rowIndex}-${colIndex}`,
            value: Math.floor(Math.random() * 100),
            color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
          }))
        )
      };
      
      setGridData(mockApiData.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load grid data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data on component mount.
  useEffect(() => {
    fetchGridData();
  }, []);

  // Effect hook to handle drawing on the canvas whenever gridData changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions to be responsive and sharp on high-DPI screens.
    const canvasWidth = cols * cellSize + (cols - 1) * gap;
    const canvasHeight = rows * cellSize + (rows - 1) * gap;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear the canvas for a new render cycle.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through the data and draw each cell.
    gridData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = colIndex * (cellSize + gap);
        const y = rowIndex * (cellSize + gap);

        // Draw the main cell rectangle.
        ctx.fillStyle = cell.color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Add a highlight for the selected cell.
        if (selectedCell && selectedCell.id === cell.id) {
          ctx.strokeStyle = '#007BFF';
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }

        // Draw the value text inside the cell.
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.value, x + cellSize / 2, y + cellSize / 2);
      });
    });
  }, [gridData, selectedCell, rows, cols, cellSize, gap]);

  // Handle click events to select a cell.
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !gridData.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine which cell was clicked based on coordinates.
    const colIndex = Math.floor(x / (cellSize + gap));
    const rowIndex = Math.floor(y / (cellSize + gap));

    if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
      const cell = gridData[rowIndex][colIndex];
      setSelectedCell(cell);
    } else {
      setSelectedCell(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading grid data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="rounded-lg border-2 border-gray-300 shadow-inner"
        ></canvas>
        <button
          onClick={fetchGridData}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Refresh Grid
        </button>
      </div>

      {selectedCell && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Selected Cell Details:</h3>
          <p className="text-gray-700"><strong>ID:</strong> {selectedCell.id}</p>
          <p className="text-gray-700"><strong>Value:</strong> {selectedCell.value}</p>
          <p className="text-gray-700"><strong>Color:</strong> {selectedCell.color}</p>
        </div>
      )}
    </div>
  );
};

export default App;
