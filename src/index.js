const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 9005;

app.get('/generate-pdf', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const inputData = req.query;

  const affectedData = JSON.parse(inputData.affected || "[]");
  const completedData = JSON.parse(inputData.completed || "[]");

  const content = `
    <html>
      <body>
        <h1>First Chart</h1>
        <canvas id="affectedChart" width="400" height="400"></canvas>
        <h1>Second Chart</h1>
        <canvas id="completedChart" width="400" height="400"></canvas>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          // Affected chart
          var affectedCtx = document.getElementById('affectedChart').getContext('2d');
          var affectedChart = new Chart(affectedCtx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(affectedData.labels || ['Ej1', 'Ej2'])},
              datasets: [{
                label: '# Affected',
                data: ${JSON.stringify(affectedData.data || [12321, 123])},
                backgroundColor: ${JSON.stringify(affectedData.backgroundColor || ["rgba(255, 99, 132, 0.2)"])},
                borderColor: ${JSON.stringify(affectedData.borderColor || ["rgba(255, 99, 132, 1)"])},
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  min: 0,
                  max: 100 
                }
              }
            }
          });
        
          // Completed chart
          var completedCtx = document.getElementById('completedChart').getContext('2d');
          var completedChart = new Chart(completedCtx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(completedData.labels || ['Ej1', 'Ej2'])},
              datasets: [{
                label: '# Completed',
                data: ${JSON.stringify(completedData.data || [123, 200])},
                backgroundColor: ${JSON.stringify(completedData.backgroundColor || ["rgba(75, 192, 192, 0.2)"])},
                borderColor: ${JSON.stringify(completedData.borderColor || ["rgba(75, 192, 192, 1)"])},
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  min: 0,
                  max: 100
                }
              }
            }
          });
        </script>
      </body>
    </html>
  `;

  await page.setContent(content);

  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
  res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`Node PDF service listening at http://localhost:${port}`);
});
