
/**
 * Utility to download data as files
 */

export const downloadAsCSV = (data: any[], fileName: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  ).join('\n');
  
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAsJSON = (data: any, fileName: string) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", fileName + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.removeChild(downloadAnchorNode);
};

export const simulatePDFDownload = (title: string, content: string) => {
  // Since we can't easily generate PDFs in the browser without a library like jsPDF
  // we'll download a text file as a mock PDF representation
  const textContent = `
    LINKYOURART - OFFICIAL PROTOCOL DOCUMENT
    ----------------------------------------
    TITLE: ${title.toUpperCase()}
    DATE: ${new Date().toLocaleString()}
    
    ${content}
    
    ----------------------------------------
    VERIFIED BY LYA IMMUTABLE REGISTRY PROTOCOL
  `;
  
  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", `${title.replace(/\s+/g, '_')}_CERTIFICATE.txt`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.removeChild(downloadAnchorNode);
};
