const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const dadosPath = path.join(__dirname, 'dados.json');

function analisarRespostas(respostas) {
    let possiveisISTs = {
        "clamidia": { descricao: "Clamídia", porcentagem: 0 },
        "gonorreia": { descricao: "Gonorreia", porcentagem: 0 },
        "sifilis": { descricao: "Sífilis", porcentagem: 0 },
        "hpv": { descricao: "HPV", porcentagem: 0 },
        "herpes": { descricao: "Herpes", porcentagem: 0 }
    };

    if (respostas.question1 === 'Sim') {
        possiveisISTs.clamidia.porcentagem += 20;
        possiveisISTs.gonorreia.porcentagem += 20;
    }
    if (respostas.question2 === 'Sim') {
        possiveisISTs.clamidia.porcentagem += 20;
        possiveisISTs.gonorreia.porcentagem += 20;
    }
    if (respostas.question3 === 'Sim') {
        possiveisISTs.sifilis.porcentagem += 30;
        possiveisISTs.hpv.porcentagem += 30;
        possiveisISTs.herpes.porcentagem += 30;
    }
    if (respostas.question4 === 'Sim') {
        possiveisISTs.hpv.porcentagem += 20;
        possiveisISTs.herpes.porcentagem += 20;
    }
    if (respostas.question5 === 'Sim') {
        possiveisISTs.clamidia.porcentagem += 10;
        possiveisISTs.gonorreia.porcentagem += 10;
        possiveisISTs.herpes.porcentagem += 10;
    }

    // Determinar se há risco de IST
    let resultado = 'negativo';
    for (const key in possiveisISTs) {
        if (possiveisISTs[key].porcentagem > 40) {
            resultado = 'positivo';
            break;
        }
    }

    return {
        analise: possiveisISTs,
        resultado: resultado
    };
}

app.post('/api/adicionar-resposta', (req, res) => {
    const respostas = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        jsonData.respostas.push(respostas);

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            const analise = analisarRespostas(respostas);
            res.json(analise);
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
