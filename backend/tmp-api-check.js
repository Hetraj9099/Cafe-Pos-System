const path = process.argv[2] || '/health';

fetch(`http://127.0.0.1:5000${path}`)
  .then(async (response) => {
    const text = await response.text();
    console.log(text);
  })
  .catch((error) => {
    console.error(String(error));
    process.exit(1);
  });
