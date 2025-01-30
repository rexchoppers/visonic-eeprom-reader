# Visonic EEPROM Reader

Quick and dirty script to extract data from Visonic Panel EEPROM via the Powerlink interface.

# Prerequisites 
- Node 20 or higher

# Installation
1. Run the following commands in the terminal
```bash
npm install
cp config.example.json config.json
```

2. Update config.json with your Powerlink IP, port and addresses of the EEPROM data you want to extract. The start **MUST BE** higher than the end address.

3. Run the following command in the terminal
```bash
npm run start
```

# Output
For each memory address, the data will be printed to a `.txt` file in the `data` folder. The file will be named with the address and the data will be in base64.