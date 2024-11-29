import { useEffect } from 'react';

const ScatterPlot = ({points}) => {
    useEffect(() => {
        const canvas = document.getElementById("scatterCanvas");
        const ctx = canvas.getContext("2d");
        
        // Create gradient background
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "green");
        grad.addColorStop(.4, "orange");
        grad.addColorStop(.6, "orange");
        grad.addColorStop(1, "red");



        // Fill rectangle with gradient
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas

        


        // Draw scatter points
        ctx.fillStyle = "black"; // Color for scatter points
        
        ctx.fillText('1', 0, 300);

        ctx.fillText('2', 75, 300);
        ctx.fillText('3', 150, 300);
        ctx.fillText('4', 225, 300);
        ctx.fillText('5', 290, 300);

        
        ctx.fillText('2', 0, 225);
        ctx.fillText('3', 0, 150);
        ctx.fillText('4', 0, 75);
        ctx.fillText('5', 0, 10);



        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Draw a circle
            ctx.fillText(point.label, point.x + 10, point.y)
            ctx.fill(); // Fill the circle
        });
    }, []); 

    return (
        <canvas id="scatterCanvas" width="300" height="300" style={{ border: "1px solid #ccc" }}></canvas>
    );
};

export default ScatterPlot;
