
import http from 'http';

function doRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function verify() {
    console.log("Verifying Gastos...");

    // 1. Get Contratos to have a valid ID
    console.log("Fetching contracts...");
    let contratoId;
    let categoryId;

    try {
        const contRes = await doRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/contratos',
            method: 'GET'
        });

        if (contRes.statusCode === 200 && Array.isArray(contRes.body) && contRes.body.length > 0) {
            contratoId = contRes.body[0].id_contrato;
            console.log(`Using contrato ID: ${contratoId}`);
        } else {
            console.log("Could not fetch contracts or empty list.");
            return;
        }

        // Get Categories
        const catRes = await doRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/gastos/categorias',
            method: 'GET'
        });
        if (catRes.statusCode === 200 && Array.isArray(catRes.body) && catRes.body.length > 0) {
            categoryId = catRes.body[0].id_categoria_gasto;
            console.log(`Using category ID: ${categoryId} (${catRes.body[0].nombre_categoria})`);
        } else {
            console.log("Could not fetch categories or empty list.");
            return;
        }


    } catch (e) {
        console.error("API Error:", e.message);
        return;
    }


    // 2. Create Gasto
    const payload = {
        id_contrato: contratoId,
        id_categoria_gasto: categoryId,
        descripcion_gasto: 'Gasto de prueba script',
        monto_gasto: 50.00,
        fecha_gasto: '2025-12-11'
    };

    console.log("Sending gasto payload:", payload);
    try {
        const createRes = await doRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/gastos',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, payload);

        if (createRes.statusCode >= 200 && createRes.statusCode < 300) {
            console.log("SUCCESS: Gasto created successfully!");
            // console.log("Response:", createRes.body);

            // 3. Verify GET
            console.log("Verifying GET /api/gastos...");
            const getRes = await doRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/gastos',
                method: 'GET'
            });

            if (getRes.statusCode === 200 && Array.isArray(getRes.body)) {
                const created = getRes.body.find(g => g.descripcion_gasto === 'Gasto de prueba script');
                if (created) {
                    console.log("SUCCESS: Found created expense in list.");
                    console.log(`Project Name: ${created.nombre_proyecto}`);
                    console.log(`Category Name: ${created.nombre_categoria}`);
                } else {
                    console.error("FAILURE: Created expense not found in list.");
                }
            }

        } else {
            console.error("FAILURE: Status code", createRes.statusCode);
            console.error("Response:", createRes.body);
        }
    } catch (e) {
        console.error("Request failed:", e.message);
    }
}

verify();
