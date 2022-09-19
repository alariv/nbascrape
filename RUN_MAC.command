echo "alustan"

forever --version || npm i forever -g
cd $( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/
npm install
cd ./react/
npm install
cd ..
forever stopall
forever start ./server.js
open http://localhost:3001/

echo $( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/


echo "LOPETAN"