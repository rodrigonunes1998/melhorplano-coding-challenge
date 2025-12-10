#Patch de atualizacao 

#1 - BUGFIX
Causa do problema: O array que armazena os planos buscados de acordo com os filtros em cache, usa um sort para realizar a ordenacao dos planos e isso e destrutivo
pois o sort modifica o array original e quando a pagina e alterada a busca ocorre em cima de um array que foi ordenado anteriormente e nao em cima do array original.


A correcao foi realizada criando um objeto copia dos Planos Buscados para aplicacao dos filtros, mantendo assim a integridade do objeto original que fica no Cache.

No endpoint onde havia o erro foi implementado as seguintes melhorias:

No  Controller foi adicionado a validacao de page e pageSize para normalizar os numeros e nao haver possibilidade de pagina ou tamanho de pagina  negativa.

No front, foi adicionado 2 filtros para ordenacao personalizada por (Preco, Franquia e Velocidade ) podendo tambem alterar a ordem em crescente e decrescente. 

No Service dos planos foi extendido a arquitetura com um core de utilitarios contendo as funcoes de filtros e ordenacao que antes eram todas dentro da funcao de busca dos planos.
Dentro do Service tambem foi organizado o codigo trazendo as interfaces para o topo do codigo e a renomeacao de algumas variaveis para deixar mais transparente oque elas executam.

A aplicacao dos filtros ela e dinamica de acordo com os filtros que chegam no queryParams , retirando a necessidade de criar um codigo procedural executando cada funcao de filtro
tornando o codigo mais limpo.

As variaveis default de cache foram tambem colocadas no topo do codigo para melhor leitura.


#2 - Foi adicionado um endpoint /plans/recomended que traz os planos recomendados com base em itens de perfil do cliente.
Este endpoint recebe os filtros como cidade, maximo de investimento, tipo (tv, apps comunds ou chats, gamer) e operadora.

Com base nos filtros a API vai fazer uma classificacao dos planos apresentando o melhor plano para o cliente.
O algoritmo ele funciona da seguinte forma: carrega todos os planos e filtra conforme os filtros, para o filtro de tipo foi estabelecido a seguinte regra: 
TV = 100-400mbps, chat/apps=50/200 mbps e gamer = >400mbps.
Apos a aplicacao dos filtros , cada plano recebe uma pontuacao pela funcao buildRecomendationScore.
A funcao speedDevitation calcula o quao fora da faixa o plano esta, se estiver abaixo do minimo ou acima do maximo o desvio cresce proporcionalmente, se estiver dentro da da faixa
mede a distancia ate o meio da faixa de intervalo e multiplica por 0.001 pra desempatar.
Tambem ha a funcao priceDistance onde se ha o maxPrice , calcula a diferenca absoluta para esse valor,  se nao ha , usa o proprio preco. Ao final e calculado speedDevitation * 1000 + priceDistance.
Apos este processo, o array e ordenado em uma classificacao ascendente onde o primeiro item sera o mais recomendado de acordo com a pontuacao. 

No frontend foi criado um modal para que o cliente preencha os dados de filtro para realizar a busca por planos recomendados.
Os dados de filtro como cidades e operadoras foram passados como props para o modal para evitar requisicoes duplicadas. 


#3 - Refatoracao e Geral
A funcao handleThing estava pouco semantica em sua nomeacao, foi alterado o nome da variavel para filterPlansBySpeedAndPrice dando uma clareza maior do seu objetivo. Seus parsed que eram feitos  em varios filter foi extendido na arquitetura
para utils em um arquivo que contem as funcoes de parsed.
Dentro do controller que executava a funcao havia a busca por todos os planos e estes planos eram passados como parametro para a funcao. Por nao ser uma responsabilidade do controller, a busca por todos os planos foi migrada para dentro do Service
onde apenas este deve ter acesso ao repository que comunica com o banco.
Dentro do service tambem foi tipado os filtros que sao recebidos pela funcao sendo: minSpeedMbps e maxPrice.

A funcao allPlans do endpoint default / tinha uma inconsistencia em que o array final sempre saia vazio pois no reduce so era aceito se o plan.price fosse undefined/null.
Realizei a mudanca do processamento para o Service, usando o controller apenas para receber a requisicao e responder.
No service a funcao foi alterada o nome para getAllPlansOnlyWithPrice para ter seu objetivo claro do que esta fazendo e no codigo da funcao invertir as ordens primeiramente
fazendo um filter onde plan.price nao pode ser undefined/null e depois fazendo um map para transformar a propriedade name para UpperCase.

Foi adicionado um processo de testes para simular situacoes que podem ocorrer garantindo uma seguranca na funcionalidade das funcoes do service. Como o service acessa o repositorio do banco de dados 
da aplicacao foi realizado um mock do banco para realizar os teste e garantir o sucesso dos resultados.

No projeto como um todo foi alterado os controllers para ter respostas mais bem elaboradas com erros descritivos, a arquitetura do banco de dados que antes ficava dentro do service foi extendida para infraestructure.
Foi utilizado o zod para algumas validacoes dos filtros que chegam nas requisicoes.
