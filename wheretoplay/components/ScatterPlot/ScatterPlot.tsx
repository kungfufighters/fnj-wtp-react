import { useEffect } from 'react';

const ScatterPlot = () => {
    useEffect(() => {
        const canvas = document.getElementById("scatterCanvas");
        const ctx = canvas.getContext("2d");
        
        // Create gradient background
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "green");
        grad.addColorStop(.4, "yellow");
        grad.addColorStop(.6, "yellow");
        grad.addColorStop(1, "red");



        // Fill rectangle with gradient
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas

        // Scatter points
        const points = [
            { x: 50, y: 70 },
            { x: 100, y: 100 }
        ];

        // Draw scatter points
        ctx.fillStyle = "white"; // Color for scatter points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Draw a circle
            ctx.fill(); // Fill the circle
        });
    }, []); 

    return (
        <canvas id="scatterCanvas" width="300" height="300" style={{ border: "1px solid #ccc" }}></canvas>
    );
};

export default ScatterPlot;
