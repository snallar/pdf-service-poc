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

  const risk_issues_by_customers_affected = JSON.parse(inputData.affected || "[]");
  const completedData = JSON.parse(inputData.completed || "[]");

  console.log(Object.keys(risk_issues_by_customers_affected));
  const content = `
    <html>
      <body>
        <h1>First Chart</h1>
        <canvas id="riskIssuesByCustomersAffectedChart" width="400" height="400"></canvas>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          // Affected chart
          var ctx1 = document.getElementById('riskIssuesByCustomersAffectedChart').getContext('2d');
          riskIssuesByCustomersAffectedChart = new Chart(ctx1, {
              type: 'horizontalBar',
              data: {
                  labels: ${Object.keys(risk_issues_by_customers_affected)},
                  datasets: [{
                      data: ${Object.values(risk_issues_by_customers_affected)},
                      backgroundColor: "#F09724",
                      borderWidth: 0
                  }]
              },
              options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true
                          },
                      }],
                      xAxes: [{
                          ticks: {
                              beginAtZero: true,
                              stepSize: 1
                          }
                      }]
                  },
                  legend: {
                      display: false
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
