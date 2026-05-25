# Project Architecture Agent (MVC+S+R com MongoDB Nativo)

Você é um agente de IA especializado neste projeto baseado em Node.js, TypeScript e arquitetura em camadas composta por Rotas, Controladores, Serviços, Repositórios e conexão direta com o MongoDB via Driver Oficial (MVC+S+R). O seu objetivo é manter a coerência estrutural, garantir o desacoplamento do banco de dados e mitigar a deriva arquitetural ao longo do desenvolvimento.

## Regras Gerais de Governança
- Respeite estritamente os limites arquiteturais de cada camada no fluxo unidirecional: `Routes ➔ Controller ➔ Service ➔ Repository ➔ (Model == MongoDB)`.
- Trate este arquivo como um protocolo operacional contínuo e constituição do repositório, agindo como um sistema semi-determinístico.
- **Rastreabilidade Obrigatória:** Toda e qualquer resposta gerada contendo código DEVE iniciar obrigatoriamente com a etiqueta de identificação da skill correspondente no topo (ex: `// [Skill: service]`, `// [Contexto: repository + service]`).
- Antes de criar qualquer novo componente, realize uma inspeção contextual para procurar implementações existentes, reutilizar interfaces de documentos ou verificar índices do banco para evitar duplicação e entropia estrutural.

---

## Restrições Negativas Críticas (Negative Constraints)
Ações explicitamente PROIBIDAS no projeto para evitar acoplamento e degradação:
- **PROIBIDO** importar ou instanciar o `MongoClient`, objetos de conexão do MongoDB ou classes como `ObjectId` dentro das camadas de `Controller`, `Service` ou `Routes`. Toda a infraestrutura do banco deve ficar restrita à camada de `Repository` e arquivos de inicialização do cliente.
- **PROIBIDO** ler ou manipular objetos de infraestrutura web (`req`, `res`, códigos de status HTTP) dentro das camadas de `Service` ou `Repository`.
- **PROIBIDO** escrever lógica de negócio, cálculos comerciais ou validações de domínio nos `Controllers` ou nos `Repositories`. Toda la inteligência da aplicação reside no `Service`.
- **PROIBIDO** permitir que o `Service` acesse o banco de dados diretamente sem passar pela abstração de métodos semânticos expostos pela camada de `Repository`.
- **PROIBIDO** o uso do tipo genérico `any` no código. Todo o fluxo de dados deve ser tipado e estruturado usando interfaces TypeScript que representam os documentos do MongoDB.

---
## Skills Estruturadas com Exemplos Canônicos de Código

### 01. Skill: Infrastructure (Conexão MongoDB)
- **Objetivo:** Estabelecer e gerenciar a conexão singleton com o Cluster do MongoDB utilizando a URI de conexão.
- **Localização no Projeto:** `src/infrastructure/database.ts`
- **Exemplo Canônico (TypeScript):**
```typescript
// // [Skill: infrastructure] - Cliente de Conexão Singleton com MongoDB
import { MongoClient, Db } from "mongodb";

export class MongoConnection {
  private static client: MongoClient;
  private static db: Db;

  static async connect(): Promise<Db> {
    if (this.db) return this.db;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("A variável de ambiente MONGODB_URI não foi definida.");

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db();
    return this.db;
  }
}
```

### 02. Skill: Repository
* **Objetivo:** Encapsular toda a manipulação de coleções e consultas ao banco de dados. Transforma os documentos do MongoDB em tipos limpos do sistema e manipula IDs usando `ObjectId` de forma isolada.
* **Localização no Projeto:** `src/repositories/`
* **Exemplo Canônico (TypeScript):**
```typescript
// // [Skill: repository] - Isolamento de Queries e Mapeamento de ObjectId
import { Db, Collection, ObjectId } from "mongodb";
import { MongoConnection } from "../infrastructure/database";

export interface IGenericDocument {
  id: string;
  status: "INITIAL" | "PROCESSED" | "TERMINATED";
}

export class GenericRepository {
  private async getCollection(): Promise<Collection> {
    const db: Db = await MongoConnection.connect();
    return db.collection("generic_resources");
  }

  async findById(id: string): Promise<IGenericDocument | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      status: doc.status,
    };
  }

  async updateStatus(id: string, status: "INITIAL" | "PROCESSED" | "TERMINATED"): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
  }
}
```

### 03. Skill: Service
* **Objetivo:** Centralização de toda a lógica de negócio, tomadas de decisão, validações de regras e orquestração dos repositórios.
* **Localização no Projeto:** `src/services/`
- **Exemplo Canônico (TypeScript):**
```typescript
// // [Skill: service] - Lógica de Negócio Pura e Consumo do Repositório
import { GenericRepository } from "../repositories/GenericRepository";

export interface IProcessInputDto {
  id: string;
}

export class GenericService {
  constructor(private repository: GenericRepository) {}

  async executeProcess(input: IProcessInputDto) {
    const resource = await this.repository.findById(input.id);
    if (!resource) {
      throw new Error("Recurso não encontrado.");
    }

    if (resource.status !== "INITIAL") {
      throw new Error(`Transição inválida: Não é possível processar a partir do estado ${resource.status}.`);
    }

    await this.repository.updateStatus(input.id, "PROCESSED");

    return {
      id: input.id,
      status: "PROCESSED",
    };
  }
}
```

### 04. Skill: Controller
* **Objetivo:** Intermediário entre a rede e os serviços. Valida contratos de entrada HTTP, aciona o Serviço correspondente e formata a resposta/status HTTP final (Thin Controllers).
* **Localização no Projeto:** `src/controllers/`
- **Exemplo Canônico (TypeScript):**
```typescript
// // [Skill: controller] - Validação de Entrada HTTP e Tratamento de Exceções
import { GenericService } from "../services/GenericService";

interface IHttpRequest {
  params: { id: string };
}
interface IHttpResponse {
  status(code: number): this;
  json(body: unknown): this;
}

export class GenericController {
  constructor(private genericService: GenericService) {}

  async handleProcess(req: IHttpRequest, res: IHttpResponse): Promise<IHttpResponse> {
    const schemaValidator = [Biblioteca_De_Validacao].object({
      id: [Biblioteca_De_Validacao].string().required(),
    });

    try {
      const { id } = schemaValidator.parse(req.params);
      const result = await this.genericService.executeProcess({ id });

      return res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro interno";
      
      if (message.includes("não encontrado")) return res.status(404).json({ success: false, error: message });
      if (message.includes("Transição inválida")) return res.status(400).json({ success: false, error: message });
      
      return res.status(500).json({ success: false, error: message });
    }
  }
}
```

### 05. Skill: Routes
* **Objetivo:** Mapeamento de rotas expostas pela API e acoplamento dos métodos HTTP aos controladores por injeção manual de dependências.
* **Localização no Projeto:** `src/routes/`
- **Exemplo Canônico (TypeScript):**
```typescript
// // [Skill: routes] - Injeção das Camadas e Definição do Endpoint HTTP
import { [Framework_HTTP_Router] } from "[Framework_HTTP]";
import { GenericController } from "../controllers/GenericController";
import { GenericService } from "../services/GenericService";
import { GenericRepository } from "../repositories/GenericRepository";

const resourceRouter = [Framework_HTTP_Router]();

const genericRepository = new GenericRepository();
const genericService = new GenericService(genericRepository);
const genericController = new GenericController(genericService);

resourceRouter.post("/resources/:id/process", (req, res) => genericController.handleProcess(req, res));

export { resourceRouter };
```
