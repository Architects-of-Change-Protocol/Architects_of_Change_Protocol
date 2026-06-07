# RFC-001 — AOC Identity Layer v1.0

| Campo | Valor |
|---|---|
| Número RFC | 001 |
| Título | AOC Identity Layer v1.0 |
| Estado | Draft |
| Categoría | Core Protocol / Constitutional |
| Autores | AOC Protocol Architecture Working Group |
| Creado | 2026-06-06 |
| Última actualización | 2026-06-06 |
| Sustituye | — |
| Relacionado | AOC Charter, RFC-004 Evidence Layer v1.0, RFC-005 Claims Framework, Protocol Invariants Specification |

---

## Abstract

Esta RFC define la **Identity Layer** de AOC Protocol: la capa constitucional y tecnológicamente neutral mediante la cual un sujeto puede ser referenciado, reconocido y verificado a través del tiempo sin que su identidad dependa de una plataforma, proveedor, registro, institución o infraestructura únicos.

La Identity Layer establece el vocabulario canónico, las invariantes, los estados, los ciclos de vida, las reglas de verificación, delegación, recuperación, impugnación, gobernanza y trazabilidad necesarias para preservar la continuidad de identidades humanas, organizacionales, institucionales, de agentes y de máquinas. No define autenticación, autorización, wallets, interfaces de usuario, bases de datos, blockchains ni proveedores de identidad. Define los contratos semánticos que cualquier implementación conforme debe respetar.

Esta RFC deriva su legitimidad del **AOC Charter**. Hace operativas, en materia de identidad, la soberanía individual e institucional, el consentimiento explícito, la portabilidad, la neutralidad de mercado, la auditabilidad y la resistencia a captura. La Identity Layer está subordinada al Charter: ninguna interpretación de esta RFC puede ampliar poderes, eliminar límites o reducir derechos reconocidos por el Charter.

La Identity Layer precede lógicamente a RFC-004 y RFC-005. RFC-004 permite preservar evidencia sobre la existencia, control, evolución y uso de una identidad. RFC-005 permite transformar esa evidencia en assertions, claims, attestations y verificaciones capaces de contribuir a standing, capability y authority. **Identity responde quién o qué es referenciado; no responde por sí sola si ese principal es confiable, tiene standing, posee una capability o está autorizado para decidir.**

---

## Tabla de Contenidos

- [Abstract](#abstract)

1. [Scope And Normative Language](#1-scope-and-normative-language)
2. [Constitutional Alignment](#2-constitutional-alignment)
3. [Identity Principles](#3-identity-principles)
4. [Canonical Identity Model](#4-canonical-identity-model)
5. [Identity States](#5-identity-states)
6. [Identity Lifecycle](#6-identity-lifecycle)
7. [Identity Trust Model](#7-identity-trust-model)
8. [Identity Verification Model](#8-identity-verification-model)
9. [Identity Cryptographic Requirements](#9-identity-cryptographic-requirements)
10. [DID Resolution Interface](#10-did-resolution-interface)
11. [Identity Delegation Model](#11-identity-delegation-model)
12. [Identity Recovery Model](#12-identity-recovery-model)
13. [Identity Traceability Model](#13-identity-traceability-model)
14. [Identity Governance](#14-identity-governance)
15. [Identity Challenges](#15-identity-challenges)
16. [Constitutional Invariants](#16-constitutional-invariants)
17. [Anti-Capture Requirements](#17-anti-capture-requirements)
18. [Auditability Requirements](#18-auditability-requirements)
19. [Runtime Requirements](#19-runtime-requirements)
20. [Relationship With RFC-004 And RFC-005](#20-relationship-with-rfc-004-and-rfc-005)
21. [Constitutional Compliance Matrix](#21-constitutional-compliance-matrix)
22. [Open Questions](#22-open-questions)
23. [Conformance](#23-conformance)
24. [Security And Privacy Considerations](#24-security-and-privacy-considerations)
25. [Glossary](#25-glossary)

---

## 1. Scope And Normative Language

### 1.1 Scope

Esta RFC gobierna exclusivamente la semántica protocolaria de identidad en AOC. Define:

- cómo se referencia un sujeto sin confundir referencia con control;
- cómo un principal demuestra continuidad o control operativo;
- cómo terceros reconocen, verifican o cuestionan una identidad;
- cómo una identidad evoluciona sin reescribir su historia;
- cómo se distinguen identidad, delegación, standing, capability y authority;
- cómo se preservan trazabilidad, portabilidad, revocabilidad y recuperación;
- qué contratos abstractos deben exponer los runtimes conformes.

Esta RFC no define:

- métodos de login, autenticación de sesión o experiencia de onboarding;
- biometría, documentos nacionales o procedimientos comerciales de KYC;
- wallets, custodia de claves o dispositivos concretos;
- esquemas de base de datos, APIs REST o protocolos de transporte;
- ledgers, blockchains, mecanismos de consenso o tokens;
- algoritmos criptográficos específicos;
- proveedores DID, autoridades certificadoras o trust lists obligatorias;
- derechos legales automáticos sobre personas, organizaciones o activos;
- políticas concretas de standing, capability, authority o governance.

### 1.2 Normative Language

Los términos **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT** y **MAY** se interpretan normativamente conforme al uso establecido por RFC 2119 y RFC 8174 cuando aparecen en mayúsculas.

- **MUST / REQUIRED** expresa una condición indispensable para conformidad.
- **MUST NOT** expresa una prohibición constitucional.
- **SHOULD / SHOULD NOT** expresa una obligación presumida que solo puede apartarse mediante justificación explícita, limitada y auditable.
- **MAY** expresa una opción de implementación que no puede alterar la semántica normativa.

### 1.3 Constitutional Precedence

En caso de conflicto, se aplica el siguiente orden de precedencia:

1. AOC Charter.
2. Invariantes constitucionales de esta RFC.
3. Especificaciones normativas transversales de AOC.
4. RFCs dependientes, incluidas RFC-004 y RFC-005.
5. Perfiles de implementación y políticas de dominio.
6. Decisiones operativas de proveedores o deployers.

Una capa inferior MUST NOT redefinir el significado de una capa superior. Una implementación puede imponer controles más estrictos, pero MUST NOT reducir soberanía, trazabilidad, contestabilidad o límites constitucionales.

---

## 2. Constitutional Alignment

La identidad es una condición necesaria para atribución, consentimiento y accountability, pero no es una fuente autosuficiente de poder. La siguiente tabla establece cómo la Identity Layer materializa los doce principios constitucionales aplicables.

| Principio | Riesgo constitucional | Mecanismo de Identity Layer | Obligación normativa | Evidencia de cumplimiento |
|---|---|---|---|---|
| **1. Supremacía** | Que un registro, proveedor o institución se declare superior al Charter o convierta su directorio en verdad absoluta. | Precedencia constitucional, pluralidad de resolvers y separación entre existencia, reconocimiento y autoridad. | Ningún identificador, registro o verifier MAY adquirir supremacía protocolaria por adopción, cuota de mercado o control de infraestructura. | Política de precedencia, rutas alternativas de resolución, decisiones de conflicto y versión normativa aplicada. |
| **2. Legitimidad** | Que la mera posesión de una cuenta o clave se interprete como legitimidad para actuar. | Cadenas explícitas de evidencia, reconocimiento y política; separación entre control e identidad. | Toda legitimidad invocada MUST ser derivable de evidencia verificable y reglas de reconocimiento aplicables. | Evidencia de control, verification record, reconocimiento y referencias de política. |
| **3. Consentimiento** | Que una identidad sea creada, vinculada, divulgada o utilizada sin voluntad válida del sujeto. | Pruebas de participación, límites de propósito y representación auditable; excepciones restringidas para sujetos incapaces de consentir. | El consentimiento MUST ser específico, informado, verificable, revocable cuando corresponda y separado de authority. | Registro de consentimiento, alcance, tiempo, actor recopilador y revocación. |
| **4. Delegación** | Que un delegado adquiera la identidad o todos los poderes del delegador. | Objetos conceptuales de delegación explícitos, acotados y temporales. | Delegar representación MUST NOT transferir la identidad subyacente ni poderes no enumerados. | Cadena de delegación, scope, propósito, vigencia, aceptación y revocación. |
| **5. Limitación** | Que identidad o reconocimiento produzcan poderes ilimitados. | Separación Identity → Standing → Capability → Authority y evaluación contextual. | Todo efecto operativo derivado de identidad MUST estar limitado por propósito, contexto, jurisdicción y tiempo. | Decision trace que muestre límites evaluados. |
| **6. Revocabilidad** | Que vínculos, verificaciones o delegaciones permanezcan utilizables después de perder validez. | Estados de suspensión, revocación, expiración, compromiso y supersession. | Relaciones revocables MUST disponer de un mecanismo verificable de revocación; la revocación MUST ser prospectiva salvo determinación explícita de fraude histórico. | Evento de revocación, emisor competente, fundamento, effective time y propagación. |
| **7. Supervisión** | Que verificadores y registries actúen sin control. | Governance distribuida, challenges, auditoría y separación de funciones. | Todo actor con capacidad de reconocer, suspender o revocar MUST estar sujeto a revisión y challenge. | Historial de decisiones, recusaciones, revisiones y métricas de concentración. |
| **8. Accountability** | Que no sea posible atribuir una actuación a quien la ejecutó, delegó o aprobó. | Principal, Actor, Agent, event lineage y proof-of-control contextual. | Toda operación constitucionalmente relevante MUST identificar actor operativo, principal representado y cadena de delegación aplicable. | Trace firmado o verificable, resolución histórica y decision record. |
| **9. Transparencia** | Que las reglas de identidad sean opacas o mutables sin aviso. | Políticas versionadas, outcomes explicables y metadatos de resolución. | Criterios, versiones y efectos de verificación MUST ser inspeccionables; datos privados MUST minimizarse. | Policy identifier, versión, rule digest, disclosure log y explicación del outcome. |
| **10. Impugnación** | Que una identidad incorrecta, fraudulenta o capturada no pueda ser cuestionada. | Challenge lifecycle, medidas provisionales y apelación. | Todo reconocimiento con efectos adversos MUST admitir challenge por partes con standing definido. | Challenge record, evidence bundle, plazos, decisión y recurso. |
| **11. Continuidad** | Que cambios de claves, proveedores, instituciones o infraestructura destruyan la identidad o su historia. | Rotation, recovery, supersession, portabilidad y resolución temporal. | Una identidad MUST poder cambiar mecanismos operativos sin perder lineage ni reatribuir eventos históricos. | Transition proof, predecessor/successor links, snapshots y verificabilidad histórica. |
| **12. Anti-Captura** | Que un único proveedor, verifier, esquema o autoridad controle el acceso a identidad. | Interoperabilidad de identificadores, múltiples fuentes, exportabilidad y reglas de sustitución. | Ningún deployment conforme MAY exigir una dependencia exclusiva cuando exista una representación equivalente y verificable. | Pruebas de portabilidad, diversidad de fuentes, fallback y auditorías de concentración. |

### 2.1 Sovereignty Consequence

La soberanía individual exige que una persona no dependa de la permanencia o permiso discrecional de un intermediario para demostrar continuidad de identidad. La soberanía institucional exige lo mismo para organizaciones e instituciones, sin permitir que estas absorban o controlen la identidad personal de sus miembros.

Por tanto:

- el sujeto MUST poder ser distinguido de todo proveedor que lo referencia;
- una organización MUST poder cambiar operadores sin perder continuidad;
- una institución MUST NOT convertir una credencial temporal en propiedad sobre la identidad del titular;
- la portabilidad MUST preservar significado, no solo exportar bytes;
- la recuperación MUST restaurar control sin entregar soberanía ilimitada al recuperador.

---

## 3. Identity Principles

### 3.1 Identity Is Not Authority

La identidad establece a quién o qué se refiere una operación. Authority establece si ese principal está legitimado para producir un efecto dentro de un scope. Una identidad verificada puede carecer completamente de authority. Toda implementación MUST evaluar authority por separado.

### 3.2 Identity Is Not Standing

Standing es la condición contextual para presentar, impugnar, verificar, decidir o ejercer una función determinada. Existir o estar verificado no concede standing. Standing MUST derivarse de claims verificados y política aplicable según RFC-005.

### 3.3 Identity Is Not Capability

Capability es un derecho operativo explícito y limitado. Una identidad puede sostener una capability, pero su identificador no es la capability. Las implementaciones MUST NOT autorizar acciones únicamente porque reconocen al principal.

### 3.4 Identity Is Not Governance

La identidad permite atribuir participación en governance; no concede voto, veto, reconocimiento constitucional ni competencia regulatoria. Los derechos de governance MUST provenir de reglas constitucionales separadas.

### 3.5 Identity Is Not Ownership

La asociación entre un principal y un objeto no demuestra propiedad jurídica, económica, intelectual ni física. La propiedad requiere claims, evidencia, reglas y jurisdicción propias. Un sistema MUST NOT inferir ownership de control de clave o proximidad registral.

### 3.6 Identity Is Not Authentication

Authentication demuestra, para una interacción, que un actor satisface un mecanismo de acceso. Identity define continuidad y referencia más allá de una sesión. Un login exitoso no prueba identidad constitucional; una identidad constitucional no prescribe un mecanismo de login.

### 3.7 Identity Is Not Trust

Identity Trust es una conclusión contextual sobre el riesgo de depender de una representación de identidad. No es una propiedad intrínseca, universal ni permanente. La verificación aporta señales; la política y el contexto determinan trust.

### 3.8 Identity Must Be Verifiable

Toda afirmación de control, continuidad, sucesión o delegación con efectos protocolarios MUST estar respaldada por evidencia verificable. “Verificable” no significa públicamente revelada: pueden emplearse pruebas de conocimiento limitado siempre que su validez y alcance sean auditables.

### 3.9 Identity Must Be Portable

Una identidad MUST poder representarse, resolverse o migrarse mediante más de una implementación conforme. La portabilidad MUST incluir identificadores, metadatos mínimos, lineage, claves públicas o proof methods aplicables, estados y referencias de evidencia, sujetos a privacidad y consentimiento.

### 3.10 Identity Must Be Auditable

Los cambios constitucionalmente relevantes MUST dejar trazas suficientes para reconstruir qué cambió, quién lo solicitó, quién lo aprobó, bajo qué política, con qué evidencia y cuándo adquirió efecto.

### 3.11 Identity Must Survive Infrastructure Changes

La sustitución de hardware, claves, redes, proveedores, resolvers, registries o custodios MUST NOT por sí sola extinguir la identidad. La continuidad MUST probarse mediante un transition record verificable y no mediante una mutación silenciosa.

### 3.12 Identity Must Be Minimal

Una representación de identidad MUST divulgar solo los atributos necesarios para el propósito declarado. Los identificadores SHOULD evitar incorporar directamente datos personales, roles, privilegios o atributos mutables.

### 3.13 Identity Must Be Contextual

Reconocimiento, verificación y trust MUST declarar contexto. Una verificación apta para continuidad técnica puede no ser apta para una decisión jurídica, financiera, clínica o gubernamental.

### 3.14 Identity Must Be Temporally Explicit

Toda conclusión sobre identidad MUST distinguir event time, effective time, verification time y observation time cuando difieran. El estado actual MUST NOT reescribir el estado histórico.

### 3.15 Identity Must Be Contestable

Una parte afectada MUST poder impugnar una asociación, verificación, suspensión, revocación, sucesión o delegación. El proceso MUST ser trazable, limitado y sujeto a revisión.

### 3.16 Identity Must Be Recoverable Without Capture

Los mecanismos de recuperación MUST distribuir riesgo, limitar poderes y producir evidencia. Ningún recuperador SHOULD poder apropiarse unilateralmente de la identidad ni borrar su historia.

### 3.17 Identity Must Be Scheme-Neutral

El protocolo MUST aceptar múltiples esquemas de identificadores capaces de satisfacer sus invariantes. DID, URI y esquemas futuros son representaciones; ninguno es constitucionalmente privilegiado.

### 3.18 Identity Must Preserve Historical Truth

Revocación, compromiso, expiración o supersession actuales MUST NOT invalidar automáticamente actos históricamente válidos. La evaluación histórica MUST utilizar el estado y la política vigentes al tiempo relevante, incorporando evidencia posterior de fraude cuando exista.

### 3.19 Identity Must Separate Subject From Controller

El sujeto referenciado y quien controla los mecanismos operativos pueden ser distintos. Esta distinción es obligatoria para menores, representados, organizaciones, máquinas, custodias y agentes.

### 3.20 Identity Must Permit Privacy-Preserving Existence

La conformidad MUST admitir identidades pseudónimas y, donde la política lo permita, anónimas. La verificabilidad no exige identificación civil ni correlación universal.

---

## 4. Canonical Identity Model

### 4.1 Canonical Record

Una **Canonical Identity Record** es la representación semántica mínima de una identidad en un punto del tiempo. No prescribe serialización. Una representación conforme MUST poder expresar, directa o referencialmente:

| Elemento | Significado | Requisito |
|---|---|---|
| Identity Reference | Identificador estable dentro de un namespace o esquema declarado. | MUST |
| Subject Reference | Sujeto al que la identidad se refiere, cuando sea expresable sin violar privacidad. | MUST o referencia protegida |
| Identity Kind | Clase canónica principal. | MUST |
| Controller Set | Principales facultados para operar mecanismos de control, sin implicar ownership. | MUST cuando exista control activo |
| Proof Methods | Métodos mediante los cuales se puede demostrar control o continuidad. | MUST para estado Verified/Active, salvo identidad anónima contextual |
| State | Estado canónico y reason code. | MUST |
| Validity Interval | Intervalo de vigencia de la representación o sus verificaciones. | MUST |
| Lineage | Predecessor, successor, split, merge o recovery links. | MUST cuando aplique |
| Verification References | Referencias a verificaciones y evidencia, no necesariamente su contenido privado. | MUST para conclusiones verificadas |
| Governance Context | Política, jurisdicción y autoridad de reconocimiento aplicables. | MUST cuando produzca efectos gobernados |
| Version | Versión inmutable de la representación. | MUST |
| Temporal Metadata | Created, effective, observed y superseded times relevantes. | MUST |

### 4.2 Roles And Kinds

Los términos canónicos pueden representar **roles**, **tipos de sujeto** o **formas de operación**. Un mismo principal puede ocupar varios roles simultáneamente, pero cada efecto MUST evaluarse según el rol invocado.

#### 4.2.1 Subject

- **Propósito:** entidad, persona, colectivo, sistema, recurso o concepto acerca del cual se expresa identidad.
- **Lifecycle:** existe conceptualmente antes de cualquier registro; puede tener cero, una o múltiples representaciones de identidad.
- **Restricciones:** no se presume que el Subject controle claves, consienta, actúe o sea legalmente personificado.
- **Relaciones:** es referenciado por Identity Records; puede ser representado por uno o más Principals.

#### 4.2.2 Principal

- **Propósito:** ancla canónica a la que el protocolo puede atribuir actions, claims, delegations y decisions.
- **Lifecycle:** creación de referencia, verificación, activación, rotación, suspensión, recuperación, revocación y preservación histórica.
- **Restricciones:** Principal no significa humano, usuario, propietario, autoridad ni entidad legal.
- **Relaciones:** puede actuar como Subject, Controller, Delegator, Delegate, Issuer, Verifier o Challenger.

#### 4.2.3 Actor

- **Propósito:** rol conductual del principal que realiza una acción observable.
- **Lifecycle:** se instancia por contexto de actuación y termina con esa actuación o sesión lógica.
- **Restricciones:** toda acción MUST vincular Actor con Principal; el actor operativo no puede ocultar al principal representado cuando exista delegación.
- **Relaciones:** produce eventos; puede usar un Agent o Runtime Identity.

#### 4.2.4 Agent

- **Propósito:** actor capaz de perseguir objetivos o ejecutar acciones en nombre propio o delegado, humano o artificial.
- **Lifecycle:** provisionamiento, activación, asignación de mandato, operación, suspensión, actualización y retiro.
- **Restricciones:** autonomía no implica authority; MUST declarar principal responsable, mandato, límites y reglas de escalación cuando actúe delegado.
- **Relaciones:** puede ser Machine Identity, Actor y Delegate; nunca absorbe la identidad del delegador.

#### 4.2.5 Organization

- **Propósito:** identidad de una colectividad coordinada que puede persistir a pesar del cambio de miembros.
- **Lifecycle:** constitución, reconocimiento, cambios de control, reestructuración, merger, split, disolución y preservación.
- **Restricciones:** la identidad organizacional MUST separarse de identidades de fundadores, empleados, operadores y proveedores.
- **Relaciones:** puede contener unidades, designar Agents y actuar mediante Principals autorizados.

#### 4.2.6 Institution

- **Propósito:** organización reconocida dentro de un marco normativo, social o jurisdiccional para desempeñar funciones persistentes.
- **Lifecycle:** establecimiento, reconocimiento, cambio de mandato, sucesión, suspensión, disolución o reemplazo.
- **Restricciones:** reconocimiento institucional no concede competencia universal; MUST declarar marco, función y jurisdicción.
- **Relaciones:** puede reconocer identidades, emitir attestations o gobernar políticas solo dentro de authority separadamente derivada.

#### 4.2.7 Runtime Identity

- **Propósito:** identificar una instancia o dominio de ejecución que produce o media acciones protocolarias.
- **Lifecycle:** provisionamiento, attestation, activación, rotación, actualización material, decommission y archivo.
- **Restricciones:** MUST distinguirse del software, operador, host, Agent y usuario; reinicios o réplicas no pueden crear continuidad falsa.
- **Relaciones:** opera para un Principal; puede hospedar Machine Identities o Agents.

#### 4.2.8 Machine Identity

- **Propósito:** identificar un sistema no humano, servicio, dispositivo o proceso con continuidad operacional definida.
- **Lifecycle:** manufactura o creación, enrollment, binding, operación, maintenance, transfer, retirement y destruction record.
- **Restricciones:** MUST declarar owner/operator/controller por separado; no puede recibir derechos humanos inherentes por equivalencia técnica.
- **Relaciones:** puede actuar como Agent o Runtime Identity y sostener capabilities limitadas.

#### 4.2.9 Federated Identity

- **Propósito:** permitir que representaciones mantenidas en dominios distintos sean reconocidas como relacionadas sin consolidarlas bajo un único operador.
- **Lifecycle:** enlace, verificación bilateral o multilateral, uso, reevaluación, suspensión de enlace y terminación.
- **Restricciones:** federation MUST NOT fusionar automáticamente identidades, atributos, authority o revocation domains.
- **Relaciones:** conecta Principals mediante mappings verificables y contextuales.

#### 4.2.10 Anonymous Identity

- **Propósito:** permitir continuidad o interacción verificable sin revelar ni mantener una vinculación identificable con un sujeto fuera del contexto autorizado.
- **Lifecycle:** establecimiento contextual, prueba de elegibilidad o unicidad cuando sea necesaria, uso y expiración o retiro.
- **Restricciones:** MUST declarar propiedades demostradas y no demostradas; anonymity MUST NOT presentarse como verificación civil.
- **Relaciones:** puede sostener claims de alcance limitado y capabilities compatibles con política.

#### 4.2.11 Pseudonymous Identity

- **Propósito:** proporcionar un identificador persistente o rotatable que no revele directamente la identidad civil o raíz.
- **Lifecycle:** emisión o autogeneración, uso, rotation, optional controlled link, revocation y archival.
- **Restricciones:** correlación entre pseudónimos MUST requerir base de política, consentimiento o authority legítima; no se presume unicidad humana.
- **Relaciones:** puede vincularse selectivamente con uno o más Principals mediante evidencia protegida.

#### 4.2.12 Delegated Identity

- **Propósito:** permitir que un Actor se presente de forma explícita como representante de otro Principal.
- **Lifecycle:** grant, acceptance, activation, use, narrowing, suspension, revocation o expiration.
- **Restricciones:** no es una transferencia ontológica de identidad. Toda presentación MUST revelar que es delegada, identificar delegador y delimitar scope.
- **Relaciones:** enlaza Delegator, Delegate y Actor; puede coexistir con authority o capability delegation, pero no las sustituye.

### 4.3 Canonical Relationship Rules

| Relación | Semántica permitida | Inferencia prohibida |
|---|---|---|
| Subject → Principal | Un principal representa protocolariamente a un sujeto. | Que el sujeto consintió, controla o posee el principal. |
| Principal → Actor | El principal actúa en un evento. | Que toda acción del actor está autorizada. |
| Principal → Agent | El agente opera para o como principal bajo un mandato. | Que autonomía equivale a authority. |
| Organization → Member | Existe membresía verificable. | Que el miembro puede representar a la organización. |
| Institution → Recognition | La institución reconoce una identidad bajo una política. | Que el reconocimiento es universal. |
| Runtime → Operator | Un operador administra el runtime. | Que el operador es el sujeto de todas las acciones. |
| Machine → Controller | Un principal controla mecanismos de la máquina. | Que controla todos sus outputs o posee sus activos. |
| Principal ↔ Federated Principal | Existe mapping contextual. | Que ambas referencias son globalmente idénticas. |
| Principal → Pseudonym | Existe vínculo protegido. | Que terceros pueden correlacionarlo libremente. |
| Delegator → Delegate | Existe representación limitada. | Que el delegado hereda identity, standing, capability o authority no expresos. |

### 4.4 Multiplicity And Non-Uniqueness

Un Subject MAY tener múltiples Principals o identifiers por razones de privacidad, jurisdicción, separación de funciones o resiliencia. Un identifier MUST resolver a una representación no ambigua dentro de su scheme y temporal context, pero el protocolo no exige un identificador universal por sujeto.

Las implementaciones MUST NOT:

- imponer correlación global como condición general de participación;
- asumir que dos identifiers diferentes representan sujetos diferentes;
- asumir que identifiers equivalentes en un dominio son equivalentes en todos;
- colapsar organization, operator, agent y runtime en un único principal;
- usar biometría o atributos inmutables como identificador universal obligatorio.

---

## 5. Identity States

### 5.1 Canonical States

| Estado | Significado | Operaciones permitidas | Restricciones |
|---|---|---|---|
| **Draft** | Representación propuesta, aún no sometida a verificación. | Completar metadatos, adjuntar evidencia, retirar draft. | MUST NOT producir efectos de identidad verificada. |
| **Pending Verification** | Existe una solicitud de verificación no concluida. | Recolectar evidencia, responder requerimientos, cancelar. | MUST NOT presentarse como Verified; el estado previo activo puede mantenerse si se trata de reverification. |
| **Verified** | Criterios declarados fueron satisfechos en un tiempo y contexto determinados. | Activar, reconocer, solicitar claims, renovar. | No implica Active, trusted, standing ni authority. |
| **Active** | La identidad puede utilizarse dentro de su vigencia y contextos reconocidos. | Resolver, probar control, delegar dentro de límites, rotar. | Requiere control vigente o excepción gobernada explícita. |
| **Suspended** | Uso prospectivo temporalmente restringido mientras subsiste la identidad. | Investigar, challenge, recover, reinstate o revoke. | MUST incluir alcance, razón, autoridad, effective time y condiciones de revisión. |
| **Revoked** | Una representación, método o reconocimiento fue retirado de uso futuro. | Verificación histórica, challenge, archival, successor resolution. | MUST NOT borrar historia; requiere objeto y alcance exactos de revocación. |
| **Expired** | Finalizó el intervalo de validez sin renovación. | Historical verification, renew mediante nueva versión, supersede. | MUST NOT tratarse automáticamente como fraude o revocación. |
| **Compromised** | Existe evidencia suficiente de pérdida, abuso o exposición de control. | Containment, suspension, recovery, rotation, investigation. | Las operaciones posteriores al compromise time presumido MUST elevarse a revisión. |
| **Superseded** | Otra versión o identidad sucesora reemplaza prospectivamente esta representación. | Resolución histórica y redirección verificable. | MUST conservar lineage; successor no hereda automáticamente claims o authority. |
| **Terminated** | La identidad dejó de operar por muerte, disolución, destrucción o cierre definitivo reconocido. | Preservación, resolución histórica, sucesión de obligaciones. | MUST NOT reutilizarse ni reactivarse; un retorno operativo requiere nueva identidad o proceso constitucional excepcional. |
| **Archived** | El registro se conserva exclusivamente para historia, auditoría o prueba. | Resolución histórica y verificación de integridad. | MUST NOT usarse como identidad activa. |

### 5.2 Valid State Transitions

| Desde | Hacia | Condición mínima |
|---|---|---|
| Draft | Pending Verification | Solicitud válida y evidencia inicial. |
| Draft | Terminated | Retiro antes de activación. |
| Pending Verification | Verified | Outcome satisfactorio bajo política identificada. |
| Pending Verification | Draft | Evidencia insuficiente corregible o retiro. |
| Pending Verification | Terminated | Rechazo final o abandono; el rechazo MUST NOT equipararse a fraude sin evidencia. |
| Verified | Active | Activación por controller competente y reconocimiento requerido. |
| Verified | Expired | Fin de validity antes de activación. |
| Verified | Revoked | Revocación válida del record o verification. |
| Active | Pending Verification | Reverification periódica o por evento; MAY continuar Active según riesgo. |
| Active | Suspended | Medida temporal basada en evidencia y authority competente. |
| Active | Compromised | Determinación de compromise. |
| Active | Expired | Fin de validity. |
| Active | Revoked | Revocación prospectiva válida. |
| Active | Superseded | Transition proof hacia successor. |
| Active | Terminated | Evento final aplicable al sujeto o representación. |
| Suspended | Active | Reinstatement tras resolver causa y verificar control. |
| Suspended | Compromised | Confirmación de compromise. |
| Suspended | Revoked | Determinación final limitada. |
| Suspended | Expired | Fin de validity durante suspensión. |
| Suspended | Superseded | Recovery o transición válida. |
| Compromised | Suspended | Containment mientras continúa investigación. |
| Compromised | Superseded | Recovery/rotation con continuity proof. |
| Compromised | Revoked | Imposibilidad o improcedencia de recovery. |
| Expired | Superseded | Nueva versión verificada enlazada. |
| Revoked | Archived | Cierre de ventanas operativas de challenge, sin borrar apelaciones. |
| Superseded | Archived | Preservación tras estabilizar successor. |
| Terminated | Archived | Preservación final. |

### 5.3 Forbidden Transitions

Son transiciones prohibidas:

- Revoked → Active sin una nueva versión y resolución formal que establezca que la revocación fue anulada; la historia MUST conservar ambos eventos.
- Terminated → Active.
- Archived → Active.
- Compromised → Active sin recovery, rotation o determinación probatoria que invalide el compromise.
- Superseded → Active si ello genera dos continuidades incompatibles; una reactivación excepcional MUST ser un nuevo event branch gobernado.
- Cualquier transición silenciosa o retroactiva que elimine el estado anterior.

### 5.4 State Scope

El estado MUST declarar su objeto. Pueden coexistir:

- identidad Active con una key Revoked;
- identidad Active con una verification Expired;
- identidad Suspended en un jurisdictional context y Active en otro;
- principal Active con una delegation Revoked;
- identity record Superseded mientras su evidencia histórica continúa Valid.

Una implementación MUST NOT propagar un estado de un objeto a otro sin regla explícita y trazable.

---

## 6. Identity Lifecycle

### 6.1 Creation

Creation establece una referencia y una primera versión, no una verdad absoluta. El proceso MUST:

1. declarar identity kind y scheme;
2. establecer subject y controller semantics, aunque una referencia protegida sustituya datos sensibles;
3. impedir colisión dentro del namespace aplicable;
4. fijar created time y version;
5. declarar propósito y política inicial;
6. generar evidencia del acto de creación;
7. no atribuir verificación, standing ni authority implícitos.

### 6.2 Verification

Verification evalúa assertions concretas: control, continuidad, relación con un sujeto, existencia institucional u otras. MUST producir un outcome, confidence, scope, policy version, evidence references y expiration o reevaluation condition.

### 6.3 Activation

Activation habilita uso prospectivo. MUST requerir:

- estado Verified o excepción normativa expresamente documentada;
- proof method vigente;
- controller set válido;
- ausencia de suspensión, revocación o compromise bloqueantes;
- aceptación de las políticas aplicables cuando corresponda.

### 6.4 Usage

Cada uso constitucionalmente relevante MUST permitir reconstruir:

- qué Identity Reference fue presentada;
- qué Actor operó;
- qué Principal fue representado;
- qué proof method y version se evaluaron;
- qué delegation chain fue invocada;
- qué policy context gobernó el uso;
- cuál fue el outcome sin registrar secretos innecesarios.

### 6.5 Delegation

Delegation MUST ser explícita, limitada, aceptada cuando la política lo exija, temporal y revocable. La delegación no cambia al Subject ni crea continuidad entre identidades.

### 6.6 Rotation

Rotation reemplaza proof methods o controllers operativos preservando la identidad. MUST:

- enlazar material anterior y nuevo;
- declarar effective time y overlap window;
- ser autorizada por mecanismos vigentes o recovery policy;
- impedir downgrade no autorizado;
- preservar capacidad de verificar eventos históricos;
- distinguir routine rotation de compromise rotation.

### 6.7 Recovery

Recovery restablece control o continuidad cuando mecanismos normales no están disponibles. MUST seguir la sección 12, aplicar controles de anti-captura y producir un successor o nueva version, nunca una mutación opaca.

### 6.8 Suspension

Suspension es temporal y proporcional. MUST declarar alcance, razón, evidencia, decisor competente, inicio, review deadline y vías de challenge. SHOULD preferirse a revocación cuando los hechos sean inciertos y el riesgo pueda contenerse.

### 6.9 Revocation

Revocation retira prospectivamente una key, verification, delegation, recognition o identity representation. MUST identificar con precisión el objeto revocado y MUST NOT afirmar efectos retroactivos sin adjudicación separada.

### 6.10 Termination

Termination reconoce el fin operacional definitivo. Para humanos puede corresponder a muerte verificada; para organizations, disolución; para machines, retiro irreversible. La terminación MUST prever sucesión legítima de obligaciones sin transferir automáticamente identity, claims o authority.

### 6.11 Historical Preservation

Después de Expired, Revoked, Superseded o Terminated, la representación MUST permanecer verificable durante los períodos definidos en la sección 18. El archivo MUST preservar:

- lineage;
- estados y tiempos;
- evidence references;
- policy versions;
- proof material público necesario;
- challenges y outcomes;
- migraciones criptográficas.

La preservación histórica MUST respetar minimización y mecanismos de protección de datos; “preservar verificabilidad” no exige preservar datos personales en claro.

---

## 7. Identity Trust Model

### 7.1 Distinct Concepts

| Concepto | Definición | Produce | No produce por sí solo |
|---|---|---|---|
| **Identity Assertion** | Declaración elemental hecha por un actor acerca de una identidad, por ejemplo “controlo esta referencia”. | Objeto evaluable. | Verdad, reconocimiento o trust. |
| **Identity Claim** | Assertion estructurada que vincula subject, predicate, issuer, scope, time y evidence. | Proposición apta para RFC-005. | Validez o authority. |
| **Identity Verification** | Evaluación reproducible de claims/evidence contra una política identificada. | Outcome y confidence. | Trust universal, standing o authority. |
| **Identity Trust** | Decisión contextual de depender de una identidad para un propósito y riesgo determinados. | Reliance decision limitada. | Verdad absoluta ni portabilidad automática a otro contexto. |
| **Identity Recognition** | Acto por el cual un dominio acepta una representación como referencia utilizable bajo sus reglas. | Interoperabilidad contextual. | Verification total, legitimacy universal o authority. |
| **Identity Authority** | Competencia separadamente derivada para ejecutar actos sobre identity records o en nombre de un principal. | Poder limitado y auditable. | Propiedad sobre el sujeto o supremacía. |

### 7.2 Sufficient Evidence

La evidencia suficiente no es una lista universal de documentos. Es la satisfacción de una **Verification Policy** proporcional al claim y riesgo. Una determinación de suficiencia MUST considerar:

1. **Relevance:** la evidencia se refiere al claim evaluado.
2. **Integrity:** alteraciones son detectables y provenance es evaluable.
3. **Attribution:** puede vincularse a productor o fuente identificable, salvo pruebas anónimas válidas.
4. **Independence:** la conclusión no descansa circularmente en el claim que intenta probar.
5. **Recency:** el tiempo de emisión u observación es adecuado para el atributo mutable.
6. **Coverage:** la evidencia cubre sujeto, scope, jurisdiction y interval requeridos.
7. **Corroboration:** riesgos altos SHOULD requerir fuentes independientes o controles equivalentes.
8. **Contestability:** existe una vía para cuestionar fuente, método o interpretación.
9. **Privacy proportionality:** no se recolecta más información que la necesaria.
10. **Policy fitness:** la política es apropiada para el propósito declarado.

### 7.3 Trust Is A Decision, Not A Score

Una implementación MAY calcular confidence, pero MUST NOT representar un único “trust score” como verdad constitucional. Toda decisión de trust MUST expresar al menos:

- propósito de reliance;
- claim o identity property evaluada;
- evidence set o commitment;
- verification outcomes;
- policy y versión;
- confidence model y límites;
- validity interval;
- unresolved contradictions;
- decisor o sistema responsable.

### 7.4 Recognition Domains

Recognition es local o federado, nunca automáticamente global. Un dominio MAY reconocer una identidad con base en:

- self-assertion verificable para usos de bajo riesgo;
- evidence-based verification;
- reconocimiento por una institución competente;
- federation mapping;
- continuity desde una identidad previamente reconocida;
- adjudicación de challenge.

El dominio MUST publicar o hacer inspeccionables sus criterios y MUST distinguir “no reconocida” de “inválida” y “fraudulenta”.

### 7.5 Non-Transitivity

Trust y recognition no son transitivos por defecto. Si A reconoce a B y B reconoce a C, A no reconoce automáticamente a C. Toda transitividad MUST estar autorizada por política que limite profundidad, scope, context, tiempo y revocation behavior.

---

## 8. Identity Verification Model

### 8.1 Verification Sources

Una Verification Source es el origen de información o prueba utilizada para evaluar identity claims. Puede ser:

- el propio Subject o Controller;
- un issuer o attester independiente;
- un registro público o privado gobernado;
- una institución dentro de competencia declarada;
- un dispositivo o runtime capaz de producir proof;
- una relación previa preservada por RFC-004;
- un conjunto distribuido de fuentes;
- una adjudicación o governance decision;
- una prueba de propiedades sin revelación del atributo subyacente.

Una source MUST identificarse por clase, provenance, competence scope, validity y conflict disclosures. Ninguna clase de source es obligatoriamente superior en todos los contextos.

### 8.2 Verification Evidence

Verification Evidence MUST ser representable conforme a RFC-004 e incluir o referenciar:

- claim evaluado;
- producer/source;
- collection method o proof semantics;
- integrity binding;
- event y observation times;
- applicable scope;
- retention/privacy classification;
- revocation o expiration signals;
- chain of custody cuando corresponda.

### 8.3 Verification Outcomes

| Outcome | Significado |
|---|---|
| **VERIFIED** | La evidencia satisface la política para el claim, scope y tiempo declarados. |
| **NOT_VERIFIED** | La evidencia disponible no satisface la política; no implica falsedad. |
| **CONTRADICTED** | Existe evidencia suficiente y aplicable contra el claim. |
| **INDETERMINATE** | Fallos, ambigüedad o evidencia inaccesible impiden concluir. |
| **EXPIRED** | Una verificación previa excedió su vigencia o condición de reevaluación. |
| **REVOKED** | El outcome o su fuente fue retirado por un actor competente. |
| **CHALLENGED** | Existe impugnación pendiente con efecto definido por política. |

Los outcomes MUST incluir reason codes estables y MUST NOT reducirse a booleanos cuando la distinción afecte derechos o decisiones.

### 8.4 Verification Confidence

Confidence expresa fuerza y límites de la conclusión, no probabilidad ontológica de que el sujeto “sea quien dice ser”. El modelo MUST ser:

- declarado y versionado;
- multidimensional cuando una escala única oculte factores relevantes;
- comparable solo dentro de políticas compatibles;
- explicable en términos de evidence quality y source independence;
- incapaz de sustituir requisitos obligatorios.

Una representación RECOMMENDED contiene dimensiones como integrity, attribution, continuity, source competence, corroboration y freshness, con valores cualitativos o cuantitativos definidos por perfil.

### 8.5 Verification Expiration

Toda verification MUST tener:

- expiration time; o
- reevaluation trigger verificable; o
- justificación explícita de por qué el claim es históricamente inmutable.

Cambios de controller, compromise, source revocation, policy supersession, merger, split o material contradiction MUST disparar reevaluation según su alcance.

### 8.6 Verification Traceability

Un Verification Record MUST permitir reconstruir:

1. verifier principal y actor;
2. claim exacto;
3. evidence references y hashes/commitments cuando proceda;
4. policy identifier y version;
5. evaluation time y relevant event time;
6. outcome, reason codes y confidence;
7. dependencies y external resolutions;
8. disclosures, conflicts y exceptions;
9. expiration/reverification rule;
10. signature o proof de integridad del record.

### 8.7 Independence And Conflicts

Un verifier MUST declarar relaciones materiales con subject, issuer, challenger o operator cuando puedan afectar imparcialidad. Las políticas de alto impacto SHOULD requerir separación entre evidence producer, verifier y decision-maker, o documentar por qué no es posible y qué controles compensatorios se aplican.

---

## 9. Identity Cryptographic Requirements

Esta sección define propiedades, no algoritmos.

### 9.1 Key Ownership And Control

“Key ownership” en esta RFC significa control protocolariamente demostrable de material o mecanismos criptográficos; no determina propiedad jurídica. Una implementación MUST:

- asociar cada proof method con un Principal y un purpose;
- distinguir controller, custodian, operator y subject;
- impedir que una key habilitada para un propósito se use silenciosamente para otro;
- soportar múltiples proof methods y control conjunto cuando la política lo requiera;
- evitar exportar secretos como condición de portabilidad;
- registrar activation, rotation, suspension, revocation y compromise times.

### 9.2 Signature Verification

Toda verificación de firma MUST comprobar:

1. canonical representation del contenido firmado;
2. integridad y dominio del mensaje;
3. proof method autorizado para el purpose;
4. estado y vigencia del método en relevant time;
5. binding con identity version;
6. protección contra replay y cross-context substitution;
7. algorithm/profile permitido por política;
8. outcome no ambiguo y trazable.

Una firma válida prueba uso de un mecanismo bajo supuestos declarados; no prueba intención, consentimiento informado, truth del contenido ni authority.

### 9.3 Proof Verification

El protocolo MUST permitir pruebas distintas de firmas, siempre que el perfil declare:

- statement probado;
- public inputs y protected inputs;
- verifier procedure;
- soundness y failure assumptions;
- freshness o challenge binding;
- unlinkability/correlation properties;
- audit strategy;
- version y deprecation status.

### 9.4 Key Rotation

Rotation MUST preservar lineage y evitar discontinuidad o takeover. Debe existir una prueba verificable autorizada por:

- el método anterior todavía válido;
- un conjunto de controllers conforme a threshold policy;
- un recovery mechanism previamente comprometido; o
- una governance adjudication excepcional y challengeable.

El método anterior MUST conservarse como metadata histórica suficiente para verificar eventos previos, aun cuando ya no sea aceptable para actos nuevos.

### 9.5 Recovery

Cryptographic recovery MUST:

- estar definida antes del incidente cuando sea razonablemente posible;
- separar recovery initiation de final approval para riesgos altos;
- incorporar delay, notice o challenge window proporcional;
- impedir que recovery credentials actúen fuera del recovery purpose;
- producir una nueva version y compromise boundary;
- permitir migración si el mecanismo criptográfico deja de ser seguro.

### 9.6 Compromise Handling

Al detectarse compromise, una implementación MUST:

1. preservar evidencia y evitar destrucción de logs;
2. registrar earliest known, suspected y confirmed times por separado;
3. suspender el método afectado según riesgo;
4. identificar delegations, claims y actions potencialmente impactadas;
5. iniciar rotation/recovery o revocation;
6. notificar a relying parties por canales protocolarios definidos;
7. reevaluar eventos en la ventana afectada sin invalidarlos automáticamente;
8. preservar derecho a challenge.

### 9.7 Cryptographic Agility Invariants

- Ningún algoritmo, key type o proof system es constitucionalmente obligatorio.
- Los perfiles MUST soportar versioning y deprecation.
- La migración MUST mantener verificabilidad histórica mediante evidencia, transitional proofs o archival validation environments.
- Un cambio criptográfico MUST NOT cambiar identity semantics, scope o authority.
- Los sistemas MUST fail closed cuando un proof requerido no pueda verificarse, pero MUST distinguir failure técnico de claim contradicted.

---

## 10. DID Resolution Interface

### 10.1 Purpose And Naming

El **Identifier Resolution Interface** es el contrato abstracto para resolver referencias de identidad. Se denomina aquí DID Resolution Interface por compatibilidad conceptual, pero MUST soportar:

- DIDs;
- URIs;
- identificadores namespaced no-URI;
- referencias content-addressed;
- futuros esquemas que satisfagan invariantes de esta RFC.

No se privilegia un estándar, método o proveedor.

### 10.2 Inputs

Una solicitud de resolución MUST poder expresar:

| Input | Descripción |
|---|---|
| Identifier | Referencia exacta y scheme declarado o inferible sin ambigüedad. |
| Resolution Time | Tiempo actual o histórico al que se solicita resolver. |
| Purpose | Control, attribution, verification, recovery, historical audit u otro propósito definido. |
| Governance Context | Policy, jurisdiction o recognition domain aplicable. |
| Requested Version | Versión exacta, rango o latest permitted. |
| Proof Requirements | Freshness, assurance, acceptable methods o privacy constraints. |
| Caller Context | Solo metadata mínima necesaria para policy; no identidad universal obligatoria. |
| Correlation Constraints | Límites sobre linking, caching y secondary use. |

### 10.3 Outputs

Una resolución exitosa MUST devolver conceptualmente:

- canonical Identity Reference;
- resolved Identity Record o representación equivalente;
- version y temporal validity;
- current/historical state con scope;
- controller y proof methods aplicables al purpose;
- lineage links;
- verification y recognition references pertinentes;
- source/resolver identity;
- resolution evidence y integrity binding;
- warnings, conflicts y partial-result indicators;
- cache/retention constraints;
- resolution time y policy version.

### 10.4 Failure States

| Failure | Significado y comportamiento requerido |
|---|---|
| **MALFORMED_IDENTIFIER** | La sintaxis no puede interpretarse; MUST NOT intentar resolución heurística peligrosa. |
| **UNSUPPORTED_SCHEME** | El resolver no soporta el scheme; no implica inexistencia. |
| **NOT_FOUND** | No existe record en fuentes consultadas; no implica que el Subject no exista. |
| **NOT_RECOGNIZED** | Existe representación, pero el dominio no la reconoce para el propósito. |
| **AMBIGUOUS** | Múltiples resultados incompatibles; MUST fail closed para decisiones sensibles. |
| **UNAVAILABLE** | Fuente temporalmente inaccesible; MUST distinguirse de NOT_FOUND. |
| **INTEGRITY_FAILURE** | Falló integridad o proof; MUST elevar security event. |
| **EXPIRED** | La representación no es vigente para el requested time/purpose. |
| **REVOKED** | El objeto aplicable está revocado; MUST incluir scope y effective time. |
| **SUSPENDED** | Uso temporalmente limitado; MUST incluir authority y review metadata permitida. |
| **COMPROMISED** | El método o record tiene compromise signal aplicable. |
| **POLICY_DENIED** | La política impide revelar o usar el resultado; MUST evitar filtrar datos protegidos. |
| **HISTORICAL_GAP** | No puede reconstruirse el estado solicitado; MUST declarar qué evidencia falta. |
| **CONFLICT** | Fuentes válidas presentan estados incompatibles sin regla de precedencia concluyente. |

### 10.5 Verification Requirements

El consumidor de una resolución MUST verificar:

1. identidad e integridad del resolver response;
2. source provenance;
3. identifier-to-record binding;
4. temporal applicability;
5. proof-method authorization para el purpose;
6. state y revocation/compromise signals;
7. policy compatibility;
8. unresolved conflicts;
9. freshness y replay protection;
10. privacy y retention obligations.

Una resolución exitosa no equivale a verification del Subject ni authority del Principal.

### 10.6 Audit Requirements

Cada resolución constitucionalmente relevante MUST producir un trace que registre request semantics, sources consulted, versions, outcome, warnings, policy y tiempo. El trace SHOULD usar commitments o referencias para no registrar identificadores sensibles innecesariamente. Los resolvers MUST permitir auditoría de comportamiento sin exigir acceso indiscriminado a datos de identidad.

### 10.7 Resolver Diversity

Un deployment de alto impacto SHOULD poder consultar más de un resolver independiente o validar el resultado localmente. Cuando múltiples resolvers discrepen, la política MUST producir un resultado CONFLICT o aplicar una regla de precedencia pública, limitada y challengeable.

---

## 11. Identity Delegation Model

### 11.1 Three Distinct Delegations

| Tipo | Qué se delega | Qué NO se delega automáticamente | Ejemplo conceptual |
|---|---|---|---|
| **Identity Delegation** | Facultad limitada para presentarse o actuar como representante declarado de un principal. | Subjecthood, ownership, standing, capability, authority. | Un agent presenta una solicitud “en representación de” una organization. |
| **Authority Delegation** | Competencia normativa limitada para producir efectos dentro de un mandato. | Identidad del delegador, poderes fuera del mandato, derecho de redelegar. | Un órgano faculta a un oficial para reconocer identidades bajo una política. |
| **Capability Delegation** | Derecho operativo concreto para ejecutar una acción sobre un recurso/scope. | Competencia para crear políticas o representar universalmente al holder. | Un runtime recibe capacidad de firmar un tipo de record durante una ventana. |

Estas delegaciones MAY coexistir en una acción, pero MUST expresarse y verificarse separadamente.

### 11.2 Delegation Record

Toda delegation MUST expresar:

- delegation identifier y version;
- delegator Principal;
- delegate Principal;
- tipo de delegación;
- actions y scopes permitidos;
- purposes permitidos;
- prohibited actions;
- validity interval y activation conditions;
- jurisdiction/context;
- redelegation rule y maximum depth;
- acceptance requirement;
- supervision/escalation requirements;
- revocation mechanism;
- evidence y proof;
- governing policy.

### 11.3 Delegation Invariants

1. El delegador MUST poseer el derecho que delega al effective time.
2. Nadie puede delegar más de lo que posee (**nemo dat**).
3. La delegación MUST ser no ambigua, explícita y limitada.
4. El delegate MUST NOT presentarse como delegator; MUST declarar representación.
5. Redelegation está prohibida salvo autorización explícita.
6. Toda redelegation MUST ser igual o más estrecha que su parent.
7. La revocación del parent MUST afectar prospectivamente a descendants dependientes, salvo base independiente.
8. Expiration, suspension o compromise MUST evaluarse en cada link.
9. La cadena MUST ser finita, resolvible y libre de ciclos.
10. La identidad del delegate MUST verificarse independientemente.
11. Identity delegation no crea standing, capability ni authority.
12. Delegation use MUST producir un trace que identifique actor, delegate, delegator y cadena.
13. Los límites de purpose MUST sobrevivir federation y transformation.
14. Una delegación no puede eliminar accountability del delegator ni del delegate.
15. Emergency delegation MUST ser temporal, narrowly scoped y retrospectively reviewable.

### 11.4 Delegation Termination

Una delegation termina por expiration, revocation, completion, termination de una condición, loss of parent authority, prohibited conflict o adjudication. Termination MUST NOT borrar usos históricos; cada uso se evalúa según validez en event time.

---

## 12. Identity Recovery Model

### 12.1 Objectives

Recovery preserva continuidad frente a pérdida o cambio sin permitir apropiación. Debe equilibrar:

- continuidad del Subject y Principal;
- prevención de takeover;
- rapidez de containment;
- contestabilidad;
- privacidad;
- verificabilidad histórica;
- independencia de proveedor.

### 12.2 Recovery Policy

Toda identidad de alto impacto SHOULD tener una Recovery Policy previa que defina:

- recovery triggers;
- initiating parties;
- approving parties y thresholds;
- cooling-off/challenge periods;
- emergency containment;
- evidence requirements;
- notification channels;
- excluded/conflicted recoverers;
- succession behavior;
- privacy protections;
- post-recovery review;
- fallback si el mecanismo principal y recuperadores fallan.

### 12.3 Lost Keys

Ante pérdida sin compromise demostrado:

1. el controller solicita recovery mediante evidencia alternativa;
2. se suspende o limita el método perdido;
3. se notifica por canales previamente establecidos cuando sea seguro;
4. se cumple threshold/delay aplicable;
5. se crea nueva identity version y proof methods;
6. el método perdido se revoca prospectivamente;
7. se preserva su uso histórico y se abre challenge window.

### 12.4 Compromise

Ante compromise probable o confirmado:

- containment MAY preceder adjudicación completa;
- MUST separarse suspected compromise time de confirmed compromise time;
- toda acción en la exposure window MUST clasificarse para reevaluation;
- recovery MUST producir un explicit compromise boundary;
- claims y delegations afectadas MUST revisarse según dependencia, no revocarse indiscriminadamente;
- el atacante no puede legitimar control nuevo usando únicamente el método comprometido.

### 12.5 Institution Transitions

Cambio de administración, nombre, charter, jurisdiction, operador o legal form no determina automáticamente nueva identidad ni continuidad. La transición MUST evaluar:

- continuidad de propósito y mandato;
- instrumento de sucesión;
- obligaciones y restricciones heredadas;
- controller transition;
- recognition por dominios pertinentes;
- challenges de partes afectadas;
- qué claims, capabilities y authorities requieren reemisión.

### 12.6 Mergers

En una merger:

- las identidades predecesoras MUST permanecer históricamente distintas;
- el successor MUST declarar si es nueva identidad o continuación gobernada;
- lineage MUST expresar múltiples predecessors;
- claims, delegations, capabilities y authorities MUST NOT fusionarse automáticamente;
- obligaciones de auditoría y challenge MUST sobrevivir;
- toda continuidad de authority requiere política separada.

### 12.7 Splits

En un split:

- cada successor MUST tener referencia distinta;
- lineage MUST expresar el predecessor común;
- activos, obligations, claims y mandates MUST asignarse explícitamente;
- ningún successor puede declararse único continuador sin evidencia y reconocimiento aplicables;
- disputed continuity MUST producir CONFLICT, no una elección silenciosa del registry.

### 12.8 Death, Dissolution And Destruction

La pérdida del sujeto operativo activa termination, no recovery ordinaria. Un estate, liquidator, successor institution o replacement machine MAY recibir authority sobre records u obligaciones, pero MUST NOT apropiarse de la identidad terminada.

### 12.9 Recovery Anti-Capture Rules

- Un único proveedor MUST NOT ser el único recovery path para identidades de alto impacto.
- Recovery authority MUST ser purpose-bound y no usable para routine actions.
- Recoverers MUST estar sujetos a challenge y conflict disclosure.
- Cambiar de proveedor MUST NOT invalidar la Recovery Policy.
- Secret knowledge de un operador no puede ser la única prueba de continuidad.
- La recuperación MUST preservar predecessor evidence y no “resetear” reputación o accountability.

---

## 13. Identity Traceability Model

### 13.1 Required Questions

La trazabilidad MUST permitir responder, para cualquier relevant time:

- **¿Quién o qué era esta identidad?** Mediante subject semantics, identity kind, version y recognition context.
- **¿Quién la verificó?** Mediante verifier principal, actor, policy y outcome.
- **¿Quién la modificó?** Mediante change initiator, approver, controller y delegation chain.
- **¿Cuándo cambió?** Mediante event, effective, observed y recorded times.
- **¿Qué evidencia la respalda?** Mediante RFC-004 evidence references, provenance e integrity bindings.

### 13.2 Identity Event

Todo cambio MUST representarse como Identity Event inmutable o equivalente semántico con:

- event identifier;
- identity reference y version affected;
- event type;
- prior-state commitment;
- resulting-state commitment;
- actor y represented principal;
- delegation/authority references;
- evidence references;
- policy version;
- event/effective/recorded times;
- reason codes;
- proof of integrity;
- privacy classification;
- challenge status.

### 13.3 Canonical Event Types

Como mínimo: CREATED, SUBMITTED, VERIFIED, RECOGNIZED, ACTIVATED, UPDATED, ROTATED, DELEGATED, DELEGATION_USED, RECOVERY_INITIATED, RECOVERED, SUSPENDED, REINSTATED, REVOKED, EXPIRED, COMPROMISE_REPORTED, COMPROMISE_CONFIRMED, SUPERSEDED, MERGED, SPLIT, TERMINATED, ARCHIVED, CHALLENGED y CHALLENGE_RESOLVED.

### 13.4 Temporal Reconstruction

Un sistema conforme MUST poder resolver “state as of time T” sin aplicar retrospectivamente cambios posteriores. Cuando los records sean incompletos, MUST devolver HISTORICAL_GAP o INDETERMINATE y no fabricar continuidad.

### 13.5 Lineage Graph

Lineage MUST soportar:

- version successor;
- key/controller rotation;
- recovery successor;
- federation mapping;
- organization/institution merger;
- split successors;
- correction sin destrucción del record original;
- cryptographic migration.

El grafo MUST ser acíclico para version succession. Merger y split crean ramas explícitas, no equivalencia global.

### 13.6 Selective Auditability

Trazabilidad no exige publicidad total. El modelo MUST permitir:

- commitments verificables;
- selective disclosure;
- role-bound access;
- redaction con prueba de integridad del record no redactado;
- separation entre public state y protected evidence;
- audit bajo due process.

Una auditoría MUST poder confirmar que un evento ocurrió y fue gobernado correctamente sin obtener datos no necesarios.

---

## 14. Identity Governance

### 14.1 Governance Roles

| Rol | Puede | No puede por ese rol solamente |
|---|---|---|
| **Subject / Controller** | Crear assertions, probar control, solicitar cambios y recovery. | Auto-concederse recognition, standing o authority en otros dominios. |
| **Recognizer** | Aceptar una identidad para un purpose dentro de su dominio. | Declarar validez universal o alterar el source record. |
| **Verifier** | Evaluar claims y evidence bajo política. | Convertir outcome en authority o suprimir challenges. |
| **Registry Operator** | Preservar y resolver records conforme a reglas. | Determinar unilateralmente verdad, ownership o governance rights. |
| **Suspension Authority** | Imponer contención temporal dentro de scope delegado. | Revocar permanentemente salvo authority separada. |
| **Revocation Authority** | Revocar objetos expresamente dentro de competencia. | Borrar historia o revocar objetos fuera de scope. |
| **Challenge Body** | Admitir, investigar y resolver challenges. | Actuar sin reglas, evidencia, recusación o recurso aplicables. |
| **Auditor** | Examinar conformidad y reconstruir traces. | Modificar identity state por el solo hecho de auditar. |
| **Protocol Governance** | Mantener semántica, perfiles y conformance de esta RFC. | Apropiarse de subjects o imponer proveedor único. |

### 14.2 Recognition Authority

Cualquier principal MAY reconocer una identidad para su propio contexto privado si no infringe derechos. El reconocimiento con efectos sobre terceros MUST derivar de authority, policy y due process aplicables. Los recognizers MUST publicar:

- scope y jurisdiction;
- criteria;
- accepted evidence classes;
- review/expiration rules;
- conflicts policy;
- challenge route;
- portability behavior.

### 14.3 Questioning Authority

Pueden cuestionar una identidad:

- el Subject o Controller legítimo;
- una parte materialmente afectada;
- un verifier o recognizer que detecte contradicción;
- un auditor dentro de mandato;
- una autoridad con standing definido;
- un reporter protegido por política de seguridad.

Cuestionar no equivale a probar falsedad ni concede poder de suspensión automática.

### 14.4 Suspension Authority

Suspension solo puede imponerse por:

- el controller sobre sus propios métodos/delegations;
- un actor expresamente autorizado por governing policy;
- un emergency mechanism predefinido;
- un challenge body mediante interim order.

Requiere evidencia proporcional al riesgo, scope mínimo, duration o review deadline, notice cuando sea seguro y appeal path.

### 14.5 Revocation Authority

Revocation requiere competencia sobre el objeto exacto. En particular:

- un key controller puede revocar esa key;
- un issuer puede revocar su verification/attestation según sus reglas;
- un delegator puede revocar su delegation;
- un recognition domain puede retirar su recognition;
- una governance authority puede revocar un protocol status solo dentro de mandato.

Ninguno de estos actos revoca automáticamente la existencia del Subject ni records emitidos por terceros independientes.

### 14.6 Evidence Thresholds

| Acción | Umbral constitucional mínimo |
|---|---|
| Recognition de bajo riesgo | Evidencia suficiente según política pública o inspeccionable. |
| Recognition de alto impacto | Corroboración, source competence, conflict review y expiration. |
| Emergency suspension | Riesgo creíble e inminente; alcance mínimo; revisión rápida. |
| Ordinary suspension | Evidencia articulable, notice y opportunity to respond. |
| Revocation | Evidencia suficiente, authority clara y reasoned decision. |
| Compromise confirmation | Señales técnicas/probatorias reproducibles y análisis temporal. |
| Merger/split continuity | Instrumentos de sucesión, controller proof, recognition y challenge window. |
| Termination | Evidencia competente para identity kind y contexto. |

### 14.7 Separation Of Powers

Para identidades de alto impacto, las funciones de registry operation, verification, suspension/revocation adjudication y appeal SHOULD distribuirse entre actores independientes. Cuando se concentren, la implementación MUST documentar necesidad, límites, controles compensatorios y exit path.

### 14.8 Governance Changes

Cambios a identity policy MUST ser versionados, prospectivos, públicamente explicables para participantes afectados y sujetos a transition period. Un cambio de política MUST NOT convertir silenciosamente actos históricos válidos en inválidos.

---

## 15. Identity Challenges

### 15.1 Challengeable Acts

Pueden impugnarse:

- subject-to-principal binding;
- controller addition/removal;
- verification outcome;
- recognition o denial of recognition;
- suspension, revocation o termination;
- delegation existence, scope o use;
- recovery y rotation;
- merger/split succession;
- resolver output o historical gap;
- unauthorized correlation o disclosure;
- policy application y conflicts of interest.

### 15.2 Challenge States

| Estado | Significado |
|---|---|
| **Filed** | Challenge recibido con objeto y grounds identificables. |
| **Admissibility Review** | Se evalúan standing, plazo, scope y suficiencia inicial. |
| **Accepted** | El challenge cumple requisitos y entra a investigación. |
| **Rejected** | No cumple requisitos; MUST incluir reason y appeal path. |
| **Under Investigation** | Se recolecta y contrasta evidencia. |
| **Interim Measure** | Existe contención temporal proporcional mientras se decide. |
| **Response Pending** | Se espera respuesta de parte relevante dentro de plazo. |
| **Ready For Decision** | Record probatorio cerrado o suficientemente completo. |
| **Resolved — Upheld** | El acto impugnado se mantiene. |
| **Resolved — Modified** | El acto se limita, corrige o condiciona. |
| **Resolved — Reversed** | El acto se anula prospectiva o temporalmente según decisión. |
| **Resolved — Inconclusive** | No existe base suficiente para conclusión definitiva. |
| **Appealed** | Una instancia competente revisa la decisión. |
| **Closed** | Finalizaron acciones y preservation obligations; el record permanece. |

### 15.3 Procedure

Un proceso conforme MUST:

1. asignar challenge identifier;
2. identificar challenger y standing, permitiendo protected reporting donde proceda;
3. delimitar acto, identity version, tiempo y remedy solicitado;
4. preservar evidence y freeze destructive changes;
5. notificar a partes salvo riesgo documentado;
6. evaluar interim measures bajo proporcionalidad;
7. permitir respuesta y contradicción de evidencia;
8. gestionar conflicts y recusals;
9. emitir reasoned decision con policy y evidence references;
10. actualizar estados prospectivamente y registrar corrections;
11. ofrecer appeal/escalation cuando policy lo establezca;
12. preservar todo el trace.

### 15.4 Interim Measures

Las medidas provisionales MUST ser:

- necesarias para evitar daño o pérdida de evidencia;
- de alcance y duración mínimos;
- claramente marcadas como no finales;
- revisadas en plazo definido;
- reversibles cuando sea posible;
- incapaces de borrar el estado previo.

### 15.5 Resolution Effects

Una resolución MUST distinguir:

- corrección de metadata;
- invalidación de una verification;
- retiro de recognition;
- reinstatement;
- revocation prospectiva;
- finding de historical fraud;
- compensation/remediation fuera del alcance de esta RFC;
- necesidad de reevaluar dependent claims o decisions.

Una finding contra un link MUST NOT invalidar toda la cadena si existen bases independientes válidas.

### 15.6 Escalation

La escalación MAY dirigirse a:

- review body del recognition domain;
- federated dispute body acordado;
- protocol governance para cuestiones de conformidad;
- autoridad jurisdiccional externa cuando corresponda.

La escalación MUST preservar la distinción entre interpretación protocolaria y decisión legal. Ninguna instancia protocolaria puede atribuirse competencia jurídica no conferida.

---

## 16. Constitutional Invariants

Las siguientes invariantes son obligatorias para toda implementación conforme.

### 16.1 Separation Invariants

1. **ID-INV-001 — Identity alone does not create authority.**
2. **ID-INV-002 — Identity alone does not create standing.**
3. **ID-INV-003 — Identity alone does not create capability.**
4. **ID-INV-004 — Identity alone does not create governance rights.**
5. **ID-INV-005 — Identity alone does not prove ownership.**
6. **ID-INV-006 — Authentication does not equal constitutional identity verification.**
7. **ID-INV-007 — Signature validity does not prove truth, intent, consent or authority.**
8. **ID-INV-008 — Identity verification does not imply trust.**
9. **ID-INV-009 — Recognition in one domain does not imply universal recognition.**
10. **ID-INV-010 — A controller is not necessarily the subject, owner or beneficiary.**

### 16.2 Sovereignty Invariants

11. **ID-INV-011 — No provider owns a subject’s identity by operating its infrastructure.**
12. **ID-INV-012 — Portability MUST preserve semantics, lineage and constraints.**
13. **ID-INV-013 — A subject MUST NOT be forced into a universal identifier as a general condition of protocol participation.**
14. **ID-INV-014 — Pseudonymous and privacy-preserving identities MUST remain possible where risk policy permits.**
15. **ID-INV-015 — Correlation across contexts requires an explicit legitimate basis.**
16. **ID-INV-016 — Institutional identity MUST remain distinct from member identities.**
17. **ID-INV-017 — Machine or agent identity MUST remain attributable to responsible operational principals without pretending the identities are identical.**
18. **ID-INV-018 — Recovery MUST restore control without transferring unlimited sovereignty to recoverers.**

### 16.3 Temporal And Continuity Invariants

19. **ID-INV-019 — Every material state change MUST be versioned and temporally explicit.**
20. **ID-INV-020 — Current invalidity MUST NOT automatically erase historical validity.**
21. **ID-INV-021 — Identity compromise does not invalidate historical evidence automatically.**
22. **ID-INV-022 — Rotation MUST preserve predecessor verifiability.**
23. **ID-INV-023 — Supersession MUST preserve lineage and MUST NOT silently mutate history.**
24. **ID-INV-024 — Merger or split MUST NOT automatically transfer claims, capabilities or authority.**
25. **ID-INV-025 — Terminated or archived identities MUST NOT be silently reactivated or reassigned.**
26. **ID-INV-026 — Historical resolution MUST use the state applicable at the relevant time.**

### 16.4 Delegation Invariants

27. **ID-INV-027 — Delegation MUST be explicit, bounded, temporal and auditable.**
28. **ID-INV-028 — No principal can delegate rights it does not hold.**
29. **ID-INV-029 — Identity delegation does not imply authority delegation.**
30. **ID-INV-030 — Authority delegation does not imply capability delegation.**
31. **ID-INV-031 — Capability delegation does not transfer identity.**
32. **ID-INV-032 — Redelegation is prohibited unless explicitly permitted and narrowed.**
33. **ID-INV-033 — A delegate MUST disclose representative capacity in consequential actions.**
34. **ID-INV-034 — Revocation or expiration of a parent delegation MUST be evaluated across dependent descendants.**

### 16.5 Verification Invariants

35. **ID-INV-035 — Every verification outcome MUST name its claim, policy, scope, time and evidence basis.**
36. **ID-INV-036 — NOT_VERIFIED MUST NOT be represented as CONTRADICTED.**
37. **ID-INV-037 — Resolution success MUST NOT be represented as subject verification.**
38. **ID-INV-038 — Verification confidence MUST NOT be represented as universal truth.**
39. **ID-INV-039 — High-impact verification SHOULD avoid single-source circularity.**
40. **ID-INV-040 — Evidence collection MUST be proportionate and purpose-limited.**
41. **ID-INV-041 — Verification dependencies and conflicts MUST be disclosed.**
42. **ID-INV-042 — Expired evidence MAY support historical claims but MUST NOT be used as current evidence without policy justification.**

### 16.6 Governance And Challenge Invariants

43. **ID-INV-043 — Every coercive identity action MUST identify lawful or protocol authority, evidence and scope.**
44. **ID-INV-044 — Suspension MUST be temporary, reviewable and narrower than permanent revocation.**
45. **ID-INV-045 — Revocation MUST identify the exact object and MUST NOT erase its history.**
46. **ID-INV-046 — Affected parties MUST have a challenge path for consequential decisions.**
47. **ID-INV-047 — Emergency action MUST be followed by timely independent review.**
48. **ID-INV-048 — Registry operators MUST NOT act as unreviewable arbiters of identity truth.**
49. **ID-INV-049 — Governance policy changes MUST be versioned and non-silent.**
50. **ID-INV-050 — Conflicts of interest MUST be disclosed and managed.**

### 16.7 Anti-Capture And Interoperability Invariants

51. **ID-INV-051 — No identifier scheme, provider, verifier or registry may be constitutionally mandatory by market dominance alone.**
52. **ID-INV-052 — Conformant representations MUST be exportable in a technology-neutral form or through a lossless semantic mapping.**
53. **ID-INV-053 — Implementations MUST define exit and substitution procedures.**
54. **ID-INV-054 — Provider failure MUST NOT be equivalent to identity extinction.**
55. **ID-INV-055 — Resolver disagreement MUST be exposed, not silently normalized.**
56. **ID-INV-056 — Federation MUST NOT expand scope, authority or correlation rights silently.**
57. **ID-INV-057 — Cryptographic agility MUST NOT alter identity semantics.**
58. **ID-INV-058 — Proprietary assurance MAY supplement but MUST NOT replace inspectable protocol evidence for constitutional effects.**

### 16.8 Audit And Privacy Invariants

59. **ID-INV-059 — Every consequential identity action MUST be attributable and reconstructable.**
60. **ID-INV-060 — Auditability MUST NOT justify indiscriminate disclosure.**
61. **ID-INV-061 — Protected evidence MAY remain confidential while its existence and integrity remain verifiable.**
62. **ID-INV-062 — Audit records MUST distinguish event, effective, observed and recorded times where relevant.**
63. **ID-INV-063 — Corrections MUST append or supersede; they MUST NOT destroy the original trace.**
64. **ID-INV-064 — Retention MUST be sufficient for accountability and bounded by data-minimization obligations.**
65. **ID-INV-065 — Failure to access protected data MUST NOT be misrepresented as evidence that no data exists.**
66. **ID-INV-066 — Conformance failures MUST fail closed for consequential operations and emit stable reason codes.**

---

## 17. Anti-Capture Requirements

### 17.1 Threats

Identity capture ocurre cuando un actor puede determinar unilateralmente quién existe protocolariamente, impedir portabilidad, controlar recovery, monopolizar verification o convertir dependencia operativa en poder constitucional. Las fuentes incluyen:

- proveedor único de identifiers o resolution;
- registry único sin exportación;
- verifier único o mandatory trust list cerrada;
- custodio único de recovery;
- correlación obligatoria mediante identificador universal;
- formatos o proofs propietarios no verificables;
- governance capturada por operadores dominantes;
- costos de salida que destruyen lineage;
- suspensión extrajudicial sin challenge.

### 17.2 Mandatory Controls

Una implementación conforme MUST:

1. soportar más de un scheme o una extensión documentada para incorporarlos;
2. separar identifier semantics de resolver implementation;
3. permitir exportar records, lineage, states y evidence references en representación neutral;
4. documentar migration y exit procedures;
5. preservar historical verification después de provider exit;
6. permitir múltiples verification sources según política;
7. exponer source concentration y dependencies;
8. impedir que registry operator otorgue authority por mera inscripción;
9. mantener challenge independiente o escalable;
10. definir failover sin reasignación de identity;
11. evitar contractual o technical lock-in sobre recovery;
12. publicar deprecation y transition periods;
13. permitir local verification cuando materialmente posible;
14. evitar privileged access secreto para verificar outcomes constitucionales;
15. registrar y revisar excepciones de exclusividad.

### 17.3 Diversity Requirements

Para contextos de alto impacto:

- verification SHOULD usar fuentes independientes o controles equivalentes;
- recovery SHOULD requerir más de un trust domain;
- resolution SHOULD tener fallback independiente;
- governance SHOULD incluir representación de sujetos afectados, operadores, verificadores y auditores;
- ninguna clase de actor SHOULD controlar simultáneamente issuance, verification, suspension y appeal.

### 17.4 Substitutability Test

Una Identity Layer deployment no es anti-capture conforme si la retirada de cualquier proveedor no puede completarse sin:

- perder el identificador o su continuity mapping;
- perder verificabilidad histórica;
- aceptar términos discrecionales del proveedor saliente;
- recrear la identidad como si careciera de historia;
- transferir datos adicionales no necesarios;
- perder challenges, revocations o lineage.

### 17.5 Fork And Exit

El protocolo MUST permitir que una comunidad o institución sustituya una implementación capturada conservando records verificables y publicando un transition proof. El fork operativo no decide automáticamente cuál branch tiene legitimidad; recognition domains MUST evaluar evidence, governance process y Charter alignment.

---

## 18. Auditability Requirements

### 18.1 What Must Be Recorded

Se MUST registrar, para acciones constitucionalmente relevantes:

- creation y versioning;
- controller/proof-method changes;
- verification requests, evidence references y outcomes;
- recognition y withdrawal;
- activation y usage de alto impacto;
- delegation grant, acceptance, use, narrowing y termination;
- rotations y recoveries;
- suspensions, revocations, expirations y reinstatements;
- compromise signals y determinations;
- resolver conflicts y material failures;
- governance decisions y policy versions;
- challenges, interim measures, decisions y appeals;
- mergers, splits, supersession y termination;
- export, migration y provider exit events;
- access a protected identity evidence cuando sea auditable legal y proporcionalmente.

### 18.2 What Must Be Reconstructable

Un auditor autorizado MUST poder reconstruir:

1. state at relevant time;
2. chain of control y delegation;
3. policy and version applied;
4. evidence basis de verification y governance action;
5. actor, principal y authority que causaron el cambio;
6. temporal order y retroactivity, si la hubo;
7. affected dependent objects;
8. notices y challenge opportunities;
9. integrity de records;
10. unresolved gaps o conflicts.

### 18.3 What Must Remain Verifiable

Deben permanecer verificables:

- binding entre identifier y record version;
- proof methods históricos;
- integrity de events y evidence references;
- lineage predecessor/successor;
- policy versions;
- signatures/proofs o migration attestations;
- state transitions;
- challenge outcomes;
- reason por la cual una identidad era o no usable en un tiempo dado.

### 18.4 Retention Classes

| Clase | Contenido | Retención mínima protocolaria |
|---|---|---|
| **A — Constitutional Lineage** | Creation, versions, lineage, termination, mergers/splits, revocation roots. | Indefinida mientras cualquier dependent evidence, claim, decision u obligation pueda requerir verificación; luego archival preservation conforme a governance policy. |
| **B — Control And Verification** | Proof methods, rotations, verification records, recognition. | Vida de la identidad más el mayor período aplicable de challenge, audit o dependency verification. |
| **C — Delegation And Use** | Grants, uses, revocations y decision traces. | Vida de la delegación más el período de accountability aplicable al efecto producido. |
| **D — Security Events** | Compromise, recovery, alerts, investigations. | Hasta cerrar todos los challenges y reevaluaciones dependientes, nunca menos que la capacidad de verificar la exposure window. |
| **E — Protected Source Material** | Documentos o datos sensibles usados como evidence. | Solo el mínimo requerido por policy, law y challenge; SHOULD reemplazarse por commitments o derived proofs cuando sea posible. |
| **F — Operational Telemetry** | Logs no necesarios para lineage o decisions. | Ventana mínima proporcional; MUST ser eliminados o anonimizados al dejar de ser necesarios. |

La retención “indefinida” aplica a la verificabilidad constitucional, no necesariamente al dato personal original. Las implementaciones SHOULD preservar commitments, metadata mínima y migration proofs cuando el contenido pueda o deba eliminarse.

### 18.5 Audit Integrity

Audit records MUST ser append-only en semántica, tamper-evident, time-bound, versioned y exportable. Correcciones MUST enlazar el record corregido. El operador MUST NOT poder eliminar unilateralmente evidencia de su propia conducta sin dejar un detectable integrity failure.

### 18.6 Audit Access

Acceso de auditoría MUST estar limitado por purpose, role, scope y confidentiality. Toda divulgación SHOULD ser registrada. La ausencia de acceso público no invalida auditabilidad si existe un mecanismo independiente y gobernado de inspección.

---

## 19. Runtime Requirements

Esta sección define contratos abstractos. No prescribe APIs, transporte, almacenamiento ni implementación.

### 19.1 Identity Engine

**Responsabilidad:** evaluar lifecycle, state transitions, control, delegation y invariantes.

**Entradas conceptuales:** identity record, requested operation, actor/principal context, evidence references, policy context, relevant time.

**Salidas conceptuales:** accepted/rejected/indeterminate decision, resulting state/version, reason codes, required audit events, unmet conditions.

**MUST:**

- aplicar state machine e invariantes;
- fail closed ante ambigüedad material;
- no inferir authority de identity;
- producir explainable decision trace;
- soportar temporal evaluation;
- conservar semantic neutrality.

### 19.2 Identity Registry

**Responsabilidad:** preservar y recuperar identity records y lineage.

**Entradas conceptuales:** register, update, query, historical query, export, subscribe-to-state-change intents.

**Salidas conceptuales:** versioned record, state, lineage, integrity proof, source metadata, conflicts o failure state.

**MUST:**

- no presentarse como fuente única de verdad;
- preservar versiones y effective times;
- soportar export y migration;
- separar public metadata de protected evidence;
- exponer conflicts y gaps;
- impedir identifier reassignment incompatible con history.

### 19.3 Identity Verification Service

**Responsabilidad:** evaluar identity claims contra evidence y policy.

**Entradas conceptuales:** claim, evidence bundle/references, policy, context, relevant time, privacy constraints.

**Salidas conceptuales:** Verification Record con outcome, confidence, reasons, dependencies, expiration y trace.

**MUST:**

- distinguir NOT_VERIFIED, CONTRADICTED e INDETERMINATE;
- declarar source competence y conflicts;
- minimizar evidence disclosure;
- permitir independent re-verification cuando el proof lo admita;
- no emitir standing o authority como efecto implícito.

### 19.4 Identity Resolution Service

**Responsabilidad:** aplicar la interfaz de sección 10 sobre uno o más schemes/sources.

**Entradas conceptuales:** identifier, time, purpose, policy context, requested version, proof/privacy constraints.

**Salidas conceptuales:** resolved record y resolution metadata, o failure state preciso.

**MUST:**

- preservar scheme semantics;
- verificar source integrity;
- soportar historical resolution;
- exponer disagreement;
- aplicar retention/correlation constraints;
- ser reemplazable sin extinguir identity.

### 19.5 Identity Governance Service

**Responsabilidad:** administrar recognition policy, suspension/revocation decisions, challenges y governance traces.

**Entradas conceptuales:** governance request, identity object, evidence, standing/authority proofs, policy y conflict disclosures.

**Salidas conceptuales:** reasoned governance decision, state effect, effective time, review deadline, appeal path y audit record.

**MUST:**

- verificar standing y authority separadamente;
- aplicar due process y proportionality;
- preservar separation of powers;
- publicar policy/version references;
- soportar challenge y appeal;
- no modificar evidence ni history silenciosamente.

### 19.6 Cross-Service Contract

Los servicios MAY combinarse operativamente, pero sus funciones semánticas MUST permanecer distinguibles. Todo runtime MUST poder mostrar qué función produjo cada conclusion. Una implementación monolítica no puede usar su arquitectura para eludir separation, audit o anti-capture requirements.

### 19.7 Failure Contract

Los contratos runtime MUST usar outcomes estables, machine-readable y human-explainable. Fallos de disponibilidad, política, integridad, reconocimiento, verificación y authority MUST ser distinguibles. Ningún failure técnico debe convertirse silenciosamente en revocation o finding de fraude.

---

## 20. Relationship With RFC-004 And RFC-005

### 20.1 Constitutional Dependency Chain

```text
Identity
   ↓ identifies the subject/principal of
Evidence
   ↓ supports an
Assertion
   ↓ is structured as a
Claim
   ↓ may be supported or opposed by an
Attestation
   ↓ is evaluated through
Verification
   ↓ may satisfy policy for
Standing
   ↓ may permit receipt or exercise of a
Capability
   ↓ may contribute, with mandate and policy, to
Authority
   ↓ permits a bounded
Decision
   ↓ participates in
Governance
```

Esta cadena es una secuencia de dependencias, no una conversión automática. Cada flecha requiere reglas, evidencia y outcomes propios.

### 20.2 Identity → Evidence

Identity permite atribuir evidence a Producer, Subject, Custodian o Verifier. RFC-004 preserva el artefacto y su provenance. Identity por sí sola no prueba que el evidence sea íntegro; evidence por sí solo no prueba que el identity binding sea correcto.

**Dependencia explícita:** RFC-004 MUST referenciar Principals usando semántica compatible con esta RFC y MUST preservar identity version/relevant time cuando la atribución sea material.

### 20.3 Evidence → Assertion

Un actor interpreta o utiliza evidence para expresar una assertion. La assertion MUST identificar su issuer/actor y distinguir el contenido evidenciado de la inferencia formulada.

**Dependencia explícita:** la identidad del asserter y el evidence producer pueden diferir; RFC-005 MUST preservar esta distinción.

### 20.4 Assertion → Claim

RFC-005 estructura la assertion como claim con subject, predicate, issuer, scope, time y evidence. Esta RFC proporciona referencias de Subject y Principal, no la verdad del predicate.

**Dependencia explícita:** un Claim MUST fijar la identity version o resolución temporal suficiente para evitar ambigüedad.

### 20.5 Claim → Attestation

Un attester expresa apoyo, contradicción o contexto sobre un claim. La Identity Layer permite verificar quién es el attester; RFC-005 determina la semántica de la attestation.

**Dependencia explícita:** identidad verificada del attester no prueba competence ni independencia. Esas propiedades requieren claims y policy.

### 20.6 Attestation → Verification

Verification evalúa evidence, claims, attestations y policy. Identity verification es una subclase: evalúa claims acerca de identity/control/continuity. No toda claim verification es identity verification.

**Dependencia explícita:** el Verifier MUST ser identificable y su authority o competence MUST evaluarse separadamente cuando el outcome tenga efectos gobernados.

### 20.7 Verification → Standing

Una verification MAY satisfacer requisitos de standing. Por ejemplo, verificar que un principal es parte afectada puede contribuir a standing para challenge. No lo concede automáticamente.

**Dependencia explícita:** el Standing Engine de RFC-005 MUST evaluar policy, scope, time, recognition y unresolved challenges además del outcome.

### 20.8 Standing → Capability

Standing puede permitir que un principal solicite o reciba una capability. La capability sigue siendo un grant separado, explícito y limitado.

**Dependencia explícita:** una capability MUST vincular holder identity version/context y MUST NOT sobrevivir cambios materiales sin reevaluation.

### 20.9 Capability → Authority

Capability permite una operación; authority legitima su efecto dentro de un marco. Un sistema puede tener capacidad técnica sin authority, o authority normativa sin una capability runtime activa.

**Dependencia explícita:** authority MUST derivarse de mandate, verified claims, standing, policy y límites; identity es solo el ancla atributiva.

### 20.10 Authority → Decision

Una Decision válida requiere identificar decision-maker, authority chain, evidence considered, policy y constraints. Identity permite atribuir; no justifica el resultado.

**Dependencia explícita:** Decision traces MUST resolver Actor, represented Principal y delegated identity/authority/capability chains en relevant time.

### 20.11 Decision → Governance

Governance coordina decisiones legítimas, revisables y limitadas. La Identity Layer permite participación y accountability sin convertir el registry de identidades en órgano soberano.

**Dependencia explícita:** governance rights MUST ser definidos fuera de esta RFC y MUST permanecer challengeable y anti-capture compliant.

### 20.12 Reverse Dependencies

La cadena también produce retroalimentación controlada:

- Governance define policies de recognition y verification, subordinadas al Charter.
- Decisions pueden suspender o reconocer identity records dentro de authority.
- Authority puede autorizar verifier o registry functions.
- Capabilities permiten ejecutar operaciones sobre identity infrastructure.
- Standing permite challenges.
- Verifications actualizan confidence o recognition.
- Attestations y claims aportan nuevos identity evidence.
- RFC-004 preserva cada evento.

Ninguna retroalimentación puede reescribir evidencia histórica ni eludir invariantes de Identity Layer.

### 20.13 Dependency Table

| Capa | Consume de Identity | Produce para siguiente capa | Prohibición clave |
|---|---|---|---|
| Identity | Subject/Principal reference, control, state, lineage. | Ancla atributiva verificable. | No authority implícita. |
| Evidence (RFC-004) | Producer/subject/verifier identity context. | Artefacto íntegro y provenance. | No truth implícita. |
| Assertion | Actor e identity context. | Declaración elemental. | No verificación implícita. |
| Claim (RFC-005) | Subject/issuer references. | Proposición estructurada. | No validez implícita. |
| Attestation | Attester identity. | Apoyo, oposición o contexto. | No competence implícita. |
| Verification | Verifier identity y evidence. | Outcome contextual. | No trust universal. |
| Standing | Principal y verified claims. | Elegibilidad contextual. | No capability automática. |
| Capability | Holder identity y standing context. | Derecho operativo limitado. | No authority automática. |
| Authority | Principal, mandate, policy, standing/capability. | Competencia legítima limitada. | No poder ilimitado. |
| Decision | Actor, principal, authority chain. | Resultado justificable. | No governance legitimacy por sí sola. |
| Governance | Participantes y decision traces. | Orden institucional revisable. | No supremacía sobre Charter. |

---

## 21. Constitutional Compliance Matrix

| Principio / Invariante | Mecanismo normativo | Punto de evaluación | Evidencia mínima | Failure behavior |
|---|---|---|---|---|
| Charter supremacy | Orden de precedencia §1.3. | Policy load y governance decision. | Policy/version trace. | Rechazar regla inferior conflictiva. |
| Individual sovereignty | Subject/controller separation, portability, privacy. | Creation, resolution, migration. | Consent/basis, export y lineage. | Bloquear apropiación o lock-in. |
| Institutional sovereignty | Organization/Institution lifecycle y succession. | Controller transition, merger/split. | Transition instruments y recognition. | CONFLICT o INDETERMINATE. |
| Identity ≠ authority | Separation principles e ID-INV-001. | Authorization/decision. | Authority chain separada. | Deny/fail closed. |
| Identity ≠ standing | ID-INV-002 y RFC-005 dependency. | Standing evaluation. | Standing policy y verified claims. | NOT_ESTABLISHED, no fraude. |
| Identity ≠ capability | ID-INV-003. | Runtime operation. | Capability grant válido. | Deny. |
| Identity ≠ ownership | §3.5 e ID-INV-005. | Asset/right claim. | Ownership-specific claim/evidence. | No inferencia. |
| Verifiability | Verification Record §8.6. | Verification. | Claim, evidence, policy, outcome. | INDETERMINATE/NOT_VERIFIED. |
| Portability | Neutral export y substitution test. | Provider exit/migration. | Export package y transition proof. | Non-conformant deployment. |
| Auditability | Identity Events y retention. | Toda acción relevante. | Event trace íntegro. | Fail closed o security incident. |
| Infrastructure continuity | Rotation, recovery, supersession. | Infra/provider change. | Lineage y transition proof. | No extinción/reassignment. |
| Consent | Purpose limits y participation proof. | Creation/link/disclosure. | Consent o basis legítima. | Deny y audit. |
| Delegation limits | Delegation Record e invariantes. | Delegated action. | Chain finita y válida. | Deny; reason code. |
| Revocability | Scoped revocation. | Use/resolution. | Revocation event y effective time. | Bloqueo prospectivo. |
| Historical truth | Temporal reconstruction. | Historical audit. | State/version at T. | HISTORICAL_GAP si falta. |
| Recovery without capture | Threshold, delay, challenge, diversity. | Recovery. | Recovery Policy y approvals. | Suspender o rechazar takeover. |
| Compromise containment | §9.6 y §12.4. | Security event. | Signal, times, affected scope. | Contain y reevaluate. |
| Recognition locality | Recognition domains. | Cross-domain use. | Recognition policy/context. | NOT_RECOGNIZED. |
| Non-transitive trust | §7.5. | Federation/trust chain. | Explicit transitivity policy. | No propagación. |
| Privacy minimization | Minimal identity/selective audit. | Collection, resolution, audit. | Purpose y disclosure trace. | Deny excessive disclosure. |
| Pseudonymity | §4.2.11 e ID-INV-014/015. | Enrollment/correlation. | Context y lawful linking basis. | Impedir correlación. |
| Anonymous participation | §4.2.10. | Policy eligibility. | Property proof suficiente. | No exigir identidad civil sin base. |
| Resolver neutrality | §10 y diversity. | Resolution. | Scheme/source metadata. | UNSUPPORTED, CONFLICT o fallback. |
| Cryptographic agility | §9.7. | Profile lifecycle. | Version/deprecation/migration plan. | Rechazar proof inseguro, preservar historia. |
| Challengeability | §15. | Consequential decision. | Challenge record y appeal path. | Decisión no finalizable cuando due process sea REQUIRED. |
| Proportional suspension | §14.4/15.4. | Interim action. | Risk, scope, deadline. | Modificar/revertir medida. |
| Scoped revocation | §14.5. | Revocation. | Competence y exact object. | Rechazar overbroad effect. |
| Separation of powers | §14.7. | Governance design/audit. | Role map y conflicts. | Remediation/independent review. |
| Anti-monopoly | §17. | Conformance review. | Concentration, exit y fallback evidence. | Non-conformant hasta remediation. |
| Evidence foundation | RFC-004 binding. | Toda conclusión material. | Evidence references/provenance. | No conclusión afirmativa. |
| Claims separation | RFC-005 binding. | Claim processing. | Structured claim. | No elevation de assertion. |
| Accountability | Actor/principal/delegation trace. | Action/decision. | Attribution chain. | Deny o mark unauditable. |
| Transparency | Versioned policies/outcomes. | Governance/verification. | Policy y reason codes. | Invalid/non-conformant decision. |
| Correction without erasure | Append/supersede model. | Data correction. | Original + correction link. | Rechazar destructive edit. |
| Merger/split safety | §12.6–12.7. | Institutional transition. | Multi-lineage y allocation record. | No automatic inheritance. |
| Runtime semantic separation | §19.6. | Architecture audit. | Function-specific traces. | Non-conformant monolith behavior. |
| Precise failures | §10.4/19.7. | Resolution/runtime. | Stable reason code. | No boolean collapse. |

---

## 22. Open Questions

Las siguientes preguntas se reservan para futuras RFCs o perfiles y **no se resuelven aquí**:

1. ¿Qué assurance profiles mínimos deberían definirse para categorías de riesgo interoperables?
2. ¿Cómo se expresará canónicamente una Identity Record sin privilegiar un formato de serialización?
3. ¿Qué vocabulario normativo describirá identity kinds extensibles sin crear taxonomías discriminatorias?
4. ¿Qué requisitos adicionales corresponden a identidades de menores, personas incapacitadas o sujetos colectivos informales?
5. ¿Cómo deben gobernarse pruebas de personhood o uniqueness sin crear identificadores universales?
6. ¿Qué modelos permiten verificar machine continuity después de reemplazos parciales de hardware o software?
7. ¿Cuándo una actualización material de un Agent crea nueva identidad en lugar de nueva versión?
8. ¿Qué perfiles de privacy-preserving verification serán obligatorios en contextos de alto riesgo de vigilancia?
9. ¿Cómo deben interoperar retention obligations con derechos jurisdiccionales de supresión y rectificación?
10. ¿Qué entidad mantiene el registry de conformance profiles y cómo se evita su captura?
11. ¿Qué métricas determinan concentración excesiva de verifiers, resolvers o recovery domains?
12. ¿Qué proceso constitucional adjudica forks de identity lineage con claims de legitimidad rivales?
13. ¿Cómo se traducen recognition decisions entre jurisdicciones incompatibles sin producir reconocimiento universal?
14. ¿Qué reglas precisas gobiernan effective time cuando fuentes confiables discrepan sobre chronology?
15. ¿Cómo se preservan proofs históricos cuando primitivas criptográficas dejan de ser verificables o seguras?
16. ¿Qué disclosure mínimo es necesario para accountability de Anonymous Identities en acciones de alto impacto?
17. ¿Cuándo es legítima la correlación de pseudónimos por investigación, y qué standing y authority exige?
18. ¿Qué garantías de disponibilidad deben exigirse a resolvers en perfiles críticos?
19. ¿Cómo se acredita competencia de verifiers sin recrear un monopolio de accreditation?
20. ¿Qué remedios protocolarios, distintos de cambios de estado, deben acompañar una challenge resolution?
21. ¿Cómo deben heredarse obligaciones de auditoría en liquidaciones, mergers y cross-border splits?
22. ¿Qué modelo permite delegated identity de AI agents con supervisión humana graduada y no ficticia?
23. ¿Cuándo una organization descentralizada constituye Organization, Institution o federación de Principals?
24. ¿Qué semántica común permitirá mapear external identifiers sin afirmar equivalencia ontológica?
25. ¿Cómo se financia y gobierna preservación histórica de identidades terminadas sin depender de un custodio perpetuo?

---

## 23. Conformance

### 23.1 Conformant Implementation

Una implementación es conforme con RFC-001 si y solo si:

- implementa o mapea sin pérdida el Canonical Identity Model;
- respeta state machine y forbidden transitions;
- aplica todas las Constitutional Invariants;
- distingue identity, verification, recognition, trust, standing, capability y authority;
- soporta versioning, temporal resolution, rotation, recovery y lineage;
- produce audit traces y failure states requeridos;
- ofrece challenge o integración verificable con un mecanismo de challenge;
- satisface anti-capture, portability y substitutability requirements;
- documenta privacy, retention y cryptographic profiles;
- no introduce dependencias exclusivas como requisitos constitucionales.

### 23.2 Conformance Profiles

Futuros perfiles MAY especificar algoritmos, formatos, assurance levels, retention periods o governance procedures para dominios concretos. Un perfil:

- MUST declarar esta RFC como base;
- MUST identificar toda elección y extensión;
- MUST NOT debilitar invariantes;
- MUST mantener interoperabilidad semántica;
- MUST incluir migration y exit behavior;
- MUST ser versionado y auditable.

### 23.3 Partial Implementations

Un componente MAY declarar conformidad parcial, por ejemplo “RFC-001 Resolution Interface Conformant”, solo si:

- nombra exactamente las secciones implementadas;
- no afirma conformidad total;
- publica dependencias y funciones no cubiertas;
- preserva todas las invariantes que apliquen a su superficie;
- no induce a relying parties a inferir assurance inexistente.

### 23.4 Constitutional Failure

Una implementación MUST considerarse no conforme si:

- confiere authority por mera identidad;
- impide portabilidad o recovery fuera de un proveedor;
- borra historia de revocation, compromise o challenge;
- trata resolution como verification universal;
- carece de temporal reconstruction para actos relevantes;
- permite delegación ilimitada o no atribuible;
- suspende o revoca sin authority, evidence o challenge aplicables;
- obliga correlación universal sin base constitucional;
- presenta un registry, verifier o scheme como soberano sobre el Charter.

---

## 24. Security And Privacy Considerations

### 24.1 Principal Threats

Los perfiles de implementación MUST analizar al menos:

- key theft y controller takeover;
- recovery capture y social recovery collusion;
- identifier collision, squatting y reassignment;
- resolver poisoning, equivocation y rollback;
- replay y cross-context proof reuse;
- verifier corruption y evidence circularity;
- malicious federation mappings;
- unauthorized correlation y surveillance;
- denial of identity/resolution;
- fraudulent merger, split o succession;
- registry censorship o selective availability;
- audit-log deletion o fabrication;
- compromise concealment;
- AI agent impersonation y mandate expansion;
- cryptographic obsolescence.

### 24.2 Privacy Requirements

Implementaciones MUST aplicar privacy by design:

- data minimization;
- purpose limitation;
- selective disclosure cuando sea viable;
- unlinkability por defecto entre contextos no relacionados;
- protected evidence storage semantics;
- disclosure auditing;
- bounded retention;
- safe failure responses que eviten enumeration;
- separation entre public identifiers y sensitive attributes;
- challenge procedures que no obliguen exposición pública innecesaria.

### 24.3 Safety Against Over-Identification

Exigir mayor identificación no siempre aumenta seguridad. Puede aumentar surveillance, coercion, breach impact y exclusion. Las políticas MUST justificar cada atributo requerido y SHOULD aceptar property proofs en lugar de raw identity data cuando satisfagan el propósito.

### 24.4 Availability And Exclusion

Un Subject no debería perder derechos por indisponibilidad temporal de un proveedor. Los perfiles de alto impacto SHOULD definir grace periods, alternative proofs y human/governance review, sin convertir indisponibilidad en verification positiva.

---

## 25. Glossary

| Término | Definición |
|---|---|
| Actor | Rol conductual de un Principal que ejecuta una acción observable. |
| Agent | Actor con capacidad de perseguir objetivos o ejecutar acciones bajo mandato. |
| Anonymous Identity | Identidad contextual que permite probar propiedades sin vínculo identificable persistente fuera del contexto autorizado. |
| Authority | Competencia legítima, limitada y separadamente derivada para producir efectos. |
| Capability | Derecho operativo explícito y limitado para ejecutar una acción. |
| Challenge | Procedimiento formal para cuestionar un acto o conclusión de identidad. |
| Controller | Principal facultado para operar uno o más proof methods o cambios definidos; no implica ownership. |
| Delegated Identity | Representación explícita de un Principal por otro Actor o Principal bajo límites. |
| Evidence | Artefacto con propiedades de integridad, provenance y verificabilidad conforme a RFC-004. |
| Federated Identity | Relación verificable entre representaciones de identidad de dominios distintos sin consolidación obligatoria. |
| Identity | Representación protocolaria de continuidad y referencia de un Subject o Principal. |
| Identity Authority | Authority aplicada a actos sobre identity records o representación. |
| Identity Claim | Proposición estructurada acerca de identidad, control, continuidad o relación. |
| Identity Recognition | Aceptación contextual de una representación por un dominio. |
| Identity Trust | Decisión contextual de reliance bajo riesgo y propósito declarados. |
| Identity Verification | Evaluación de identity claims/evidence contra una policy. |
| Institution | Organization reconocida para funciones persistentes dentro de un marco normativo o social. |
| Lineage | Relaciones verificables entre versiones, predecessors, successors, mergers, splits y recoveries. |
| Machine Identity | Identidad de un sistema, servicio, dispositivo o proceso no humano. |
| Organization | Identidad colectiva persistente separada de sus miembros y operadores. |
| Principal | Ancla canónica a la que el protocolo atribuye acciones, claims, delegations o decisions. |
| Proof Method | Mecanismo verificable para demostrar control, continuidad o una propiedad declarada. |
| Pseudonymous Identity | Identidad persistente o rotatable que no revela directamente la identidad raíz. |
| Recognition Domain | Contexto y policy dentro de los cuales una identidad es aceptada. |
| Resolver | Componente que transforma una Identity Reference en un record y metadata verificables. |
| Runtime Identity | Identidad de una instancia o dominio de ejecución. |
| Standing | Condición contextual que permite ejercer una función o presentar una cuestión, definida por RFC-005. |
| Subject | Entidad, persona, colectivo, sistema, recurso o concepto al que se refiere una identidad o claim. |
| Verification Policy | Reglas versionadas que determinan evidencia, procedimiento y outcomes de verification. |

---

## Constitutional Conclusion

Identity es la primera condición de accountability, pero no su conclusión. AOC Protocol reconoce que una persona, organización, institución, máquina o agent debe poder existir protocolariamente, demostrar continuidad, cambiar sus mecanismos operativos y cuestionar decisiones sobre su identidad sin quedar subordinado a una infraestructura única.

Esta RFC establece por ello una arquitectura constitucional de separación:

- identidad sin poder implícito;
- verificación sin trust automático;
- reconocimiento sin supremacía;
- delegación sin transferencia de soberanía;
- recuperación sin captura;
- trazabilidad sin vigilancia indiscriminada;
- continuidad sin reescritura histórica;
- governance sin monopolio de verdad.

Sobre esta base, RFC-004 puede preservar evidencia y RFC-005 puede construir claims, verification, standing, capability y authority. Sin esta separación, cada capa superior heredaría una premisa ilegítima: que ser identificado equivale a tener derecho a actuar. RFC-001 prohíbe esa equivalencia y convierte la identidad en lo que constitucionalmente debe ser: **una primitiva soberana, verificable, portable, limitada, contestable y durable sobre la cual puede construirse legitimidad, pero nunca presumirse.**

---

*Este documento es RFC-001 de la serie de especificaciones de AOC Protocol. Toda enmienda MUST seguir el proceso público, versionado, trazable y anti-captura establecido por el AOC Charter y la governance aplicable. Las versiones históricas MUST permanecer accesibles y verificables.*
