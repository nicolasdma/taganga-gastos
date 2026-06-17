import { normalizeItemSearchText, searchWordVariants, tokenizeSearchQuery } from '@/lib/items'

type ConceptGroup = {
  aliases: readonly string[]
  emojis: readonly string[]
  expansions?: readonly string[]
}

const CONCEPT_GROUPS: readonly ConceptGroup[] = [
  {
    aliases: [
      'asado',
      'asados',
      'barbacoa',
      'parrilla',
      'parrillada',
      'churrasco',
      'bbq',
      'grill',
      'carne asada',
      'carne al carbon',
      'carne al carbón',
      'carne a la parrilla',
      'anticucho',
      'anticuchos',
      'pincho',
      'pinchos',
      'brocheta',
      'brochetas',
    ],
    emojis: ['🍖', '🥩', '🔥', '🍗'],
    expansions: ['carne', 'meat', 'steak', 'fire', 'cooking', 'pollo', 'chicken'],
  },
  {
    aliases: ['carne', 'carnes', 'bife', 'lomito', 'lomo', 'bistec', 'filete', 'chuleta', 'costilla', 'costillas', 'morcilla'],
    emojis: ['🥩', '🍖', '🥓'],
    expansions: ['carne', 'meat', 'steak', 'bacon'],
  },
  {
    aliases: ['pollo', 'gallina', 'alitas', 'alita', 'pechuga', 'nuggets', 'nugget', 'broaster', 'rostizado'],
    emojis: ['🍗', '🐔', '🍖'],
    expansions: ['pollo', 'chicken', 'meat'],
  },
  {
    aliases: ['chorizo', 'choripan', 'choripán', 'salchicha', 'salchipapa', 'salchipapas', 'hot dog', 'perro caliente', 'pancho'],
    emojis: ['🌭', '🍟', '🍖'],
    expansions: ['hot dog', 'sausage', 'fries'],
  },
  {
    aliases: ['milanesa', 'milanesas', 'suprema', 'apanado', 'apanados', 'rebozado', 'rebozados'],
    emojis: ['🍽️', '🍗', '🥩'],
    expansions: ['cooking', 'meat', 'chicken'],
  },
  {
    aliases: ['pescado', 'pescados', 'ceviche', 'cebiche', 'mariscos', 'camaron', 'camarón', 'camarones', 'langostino', 'langostinos'],
    emojis: ['🐟', '🦐', '🍤', '🦀'],
    expansions: ['fish', 'shrimp', 'seafood'],
  },
  {
    aliases: ['sushi', 'makis', 'maki', 'roll', 'rolls', 'nikkei'],
    emojis: ['🍣', '🍱', '🥢'],
    expansions: ['sushi', 'bento'],
  },
  {
    aliases: ['taco', 'tacos', 'burrito', 'burritos', 'quesadilla', 'quesadillas', 'nachos', 'totopos'],
    emojis: ['🌮', '🌯', '🧀'],
    expansions: ['taco', 'burrito', 'cheese'],
  },
  {
    aliases: ['arepa', 'arepas', 'cachapa', 'cachapas', 'gordita', 'gorditas', 'pupusa', 'pupusas'],
    emojis: ['🫓', '🌽', '🧀'],
    expansions: ['bread', 'corn', 'cheese'],
  },
  {
    aliases: ['empanada', 'empanadas', 'pastelito', 'pastelitos', 'salteña', 'salteñas', 'tequeño', 'tequeños'],
    emojis: ['🥟', '🍽️', '🧀'],
    expansions: ['dumpling', 'food', 'cheese'],
  },
  {
    aliases: ['tamale', 'tamal', 'tamales', 'humita', 'humitas', 'hallaca', 'hallacas', 'nacatamal', 'nacatamales'],
    emojis: ['🫔', '🌽', '🍽️'],
    expansions: ['tamale', 'corn', 'food'],
  },
  {
    aliases: ['sancocho', 'ajiaco', 'mondongo', 'pozole', 'locro', 'cazuela', 'caldo', 'sopa', 'sopas', 'guiso', 'estofado'],
    emojis: ['🍲', '🥣', '🥘'],
    expansions: ['soup', 'stew', 'pot'],
  },
  {
    aliases: ['bandeja paisa', 'bandeja', 'casado', 'corrientazo', 'corriente', 'menu del dia', 'menú del día', 'ejecutivo', 'colacion', 'colación'],
    emojis: ['🍽️', '🍛', '🥘'],
    expansions: ['plate', 'rice', 'food'],
  },
  {
    aliases: ['arroz', 'arrocito', 'chaufa', 'chifa', 'paella', 'risotto', 'gallo pinto', 'moros', 'congri'],
    emojis: ['🍚', '🍛', '🥘'],
    expansions: ['rice', 'curry', 'food'],
  },
  {
    aliases: ['frijol', 'frijoles', 'frejol', 'frejoles', 'poroto', 'porotos', 'caraotas', 'lenteja', 'lentejas'],
    emojis: ['🫘', '🍲', '🥣'],
    expansions: ['beans', 'soup'],
  },
  {
    aliases: ['pasta', 'fideos', 'tallarines', 'noodles', 'ravioles', 'lasagna', 'lasaña', 'espagueti'],
    emojis: ['🍝', '🍜', '🍽️'],
    expansions: ['pasta', 'noodle'],
  },
  {
    aliases: ['pizza', 'pizzas', 'pizzeria', 'pizzería'],
    emojis: ['🍕'],
    expansions: ['pizza'],
  },
  {
    aliases: ['hamburguesa', 'hamburguesas', 'burger', 'burgers', 'comida rapida', 'comida rápida'],
    emojis: ['🍔', '🍟', '🥤'],
    expansions: ['burger', 'fries', 'fast food'],
  },
  {
    aliases: ['papas', 'papas fritas', 'patatas', 'patatas fritas', 'yuca', 'yucas', 'mandioca', 'tostones', 'tajadas', 'maduros', 'platano', 'plátano'],
    emojis: ['🍟', '🍠', '🍌'],
    expansions: ['fries', 'potato', 'banana'],
  },
  {
    aliases: ['pan', 'panaderia', 'panadería', 'bizcocho', 'factura', 'facturas', 'medialuna', 'cuernito', 'concha', 'bolillo', 'marraqueta', 'hallulla'],
    emojis: ['🥐', '🥖', '🍞'],
    expansions: ['bread', 'croissant', 'bakery'],
  },
  {
    aliases: ['queso', 'quesos', 'quesillo', 'cuajada'],
    emojis: ['🧀'],
    expansions: ['cheese'],
  },
  {
    aliases: ['huevo', 'huevos', 'omelette', 'omelet', 'tortilla de huevo', 'perico'],
    emojis: ['🥚', '🍳'],
    expansions: ['egg', 'cooking'],
  },
  {
    aliases: ['ensalada', 'ensaladas', 'verdura', 'verduras', 'vegetales', 'veggie', 'saludable'],
    emojis: ['🥗', '🥬', '🥦'],
    expansions: ['salad', 'vegetable', 'leafy green'],
  },
  {
    aliases: ['aguacate', 'palta', 'avocado', 'guacamole'],
    emojis: ['🥑'],
    expansions: ['avocado'],
  },
  {
    aliases: ['fruta', 'frutas', 'banano', 'banana', 'platano fruta', 'manzana', 'pera', 'uvas', 'mango', 'papaya', 'piña', 'anana', 'ananá', 'sandia', 'sandía'],
    emojis: ['🍌', '🍎', '🥭', '🍍'],
    expansions: ['fruit', 'banana', 'apple', 'mango', 'pineapple'],
  },
  {
    aliases: ['helado', 'helados', 'paleta', 'paletas', 'raspado', 'raspao', 'cholado', 'nieves'],
    emojis: ['🍦', '🍨', '🍧'],
    expansions: ['ice cream', 'shaved ice'],
  },
  {
    aliases: ['postre', 'postres', 'torta', 'tortas', 'pastel', 'pasteles', 'queque', 'bizcochuelo', 'dulce', 'dulces', 'alfajor', 'alfajores'],
    emojis: ['🍰', '🧁', '🍮'],
    expansions: ['cake', 'cupcake', 'custard'],
  },
  {
    aliases: ['chocolate', 'chocolates', 'chocolatina', 'chocolatinas', 'bombon', 'bombón', 'caramelo', 'caramelos'],
    emojis: ['🍫', '🍬', '🍭'],
    expansions: ['chocolate', 'candy'],
  },
  {
    aliases: ['desayuno', 'brunch'],
    emojis: ['🍳', '🥐', '☕'],
    expansions: ['breakfast', 'egg', 'coffee'],
  },
  {
    aliases: ['almuerzo', 'comida', 'comidita', 'lonche', 'lunch'],
    emojis: ['🍽️', '🍱', '🥘'],
    expansions: ['food', 'cooking', 'bento'],
  },
  {
    aliases: ['cena', 'cenita'],
    emojis: ['🌙', '🍽️'],
    expansions: ['dinner', 'food'],
  },
  {
    aliases: ['merienda', 'onces', 'media tarde', 'snack', 'snacks', 'botana', 'botanas', 'picoteo'],
    emojis: ['🍪', '🧁', '☕'],
    expansions: ['cookie', 'snack', 'coffee'],
  },
  {
    aliases: ['picada', 'picadas', 'tabla', 'tabla de quesos', 'fiambre', 'fiambres'],
    emojis: ['🧀', '🍖', '🥖'],
    expansions: ['cheese', 'meat', 'bread'],
  },
  {
    aliases: ['delivery', 'domicilio', 'domicilios', 'pedido', 'pedidos', 'rappi', 'ifood', 'ubereats', 'uber eats', 'didi food', 'pedidosya', 'sin delantal'],
    emojis: ['🛵', '🍽️', '📦'],
    expansions: ['delivery', 'motor scooter', 'package'],
  },
  {
    aliases: ['super', 'supermercado', 'mercado', 'mercadito', 'despensa', 'abarrotes', 'colmado', 'bodega', 'almacen', 'almacén', 'tienda', 'mandado', 'mandados'],
    emojis: ['🛒', '🧺', '🏪'],
    expansions: ['shopping cart', 'basket', 'store'],
  },
  {
    aliases: ['cafe', 'café', 'cafecito', 'tinto', 'capuccino', 'cappuccino', 'latte', 'mocaccino'],
    emojis: ['☕', '🥐'],
    expansions: ['coffee'],
  },
  {
    aliases: ['mate', 'terere', 'tereré', 'chimarrao', 'chimarrão'],
    emojis: ['🧉'],
    expansions: ['mate'],
  },
  {
    aliases: ['te', 'té', 'infusion', 'infusión', 'aromatica', 'aromática'],
    emojis: ['🍵', '🫖'],
    expansions: ['tea'],
  },
  {
    aliases: ['jugo', 'jugos', 'zumo', 'zumos', 'batido', 'batidos', 'licuado', 'licuados', 'smoothie', 'limonada', 'naranjada'],
    emojis: ['🧃', '🍹', '🍊'],
    expansions: ['juice', 'beverage', 'orange'],
  },
  {
    aliases: ['gaseosa', 'gaseosas', 'soda', 'sodas', 'refresco', 'refrescos', 'cola', 'cocacola', 'coca cola'],
    emojis: ['🥤', '🧊'],
    expansions: ['soft drink', 'cup with straw'],
  },
  {
    aliases: ['agua', 'aguas', 'botellon', 'botellón', 'garrafon', 'garrafón'],
    emojis: ['💧', '🚰', '🧊'],
    expansions: ['water', 'droplet'],
  },
  {
    aliases: ['cerveza', 'cervezas', 'chela', 'chelas', 'birra', 'birras', 'fria', 'fría', 'pola'],
    emojis: ['🍺', '🍻'],
    expansions: ['beer'],
  },
  {
    aliases: ['michelada', 'micheladas'],
    emojis: ['🍺', '🍋'],
    expansions: ['beer', 'lemon'],
  },
  {
    aliases: ['vino', 'vinos', 'vinito'],
    emojis: ['🍷'],
    expansions: ['wine'],
  },
  {
    aliases: ['trago', 'tragos', 'coctel', 'cóctel', 'cocktail', 'ron', 'whisky', 'tequila', 'pisco', 'fernet', 'aguardiente', 'guaro', 'mezcal'],
    emojis: ['🥃', '🍸', '🍹'],
    expansions: ['cocktail', 'tumbler glass'],
  },
  {
    aliases: ['taxi', 'cab', 'uber', 'didi', 'cabify', 'indriver', 'beat'],
    emojis: ['🚕', '🚗'],
    expansions: ['taxi', 'car'],
  },
  {
    aliases: ['bus', 'buseta', 'colectivo', 'micro', 'bondi', 'camion', 'camión', 'guagua', 'combi', 'bus urbano'],
    emojis: ['🚌', '🚍'],
    expansions: ['bus'],
  },
  {
    aliases: ['metro', 'subte', 'subway', 'tren', 'tranvia', 'tranvía', 'metropolitano', 'transmilenio', 'sitp', 'metrobus', 'metrobús'],
    emojis: ['🚇', '🚆', '🚊'],
    expansions: ['metro', 'train', 'tram'],
  },
  {
    aliases: ['moto', 'mototaxi', 'motoconcho', 'delivery moto', 'scooter'],
    emojis: ['🏍️', '🛵'],
    expansions: ['motorcycle', 'scooter'],
  },
  {
    aliases: ['bici', 'bicicleta', 'cicla', 'ecobici', 'bikeshare'],
    emojis: ['🚲'],
    expansions: ['bicycle'],
  },
  {
    aliases: ['gasolina', 'nafta', 'bencina', 'combustible', 'diesel', 'gas', 'tanqueada', 'tanquear'],
    emojis: ['⛽', '🚗'],
    expansions: ['fuel', 'gas pump'],
  },
  {
    aliases: ['parqueo', 'parking', 'estacionamiento', 'parqueadero', 'cochera'],
    emojis: ['🅿️', '🚗'],
    expansions: ['parking'],
  },
  {
    aliases: ['peaje', 'peajes', 'caseta'],
    emojis: ['🛣️', '🚗'],
    expansions: ['motorway', 'car'],
  },
  {
    aliases: ['vuelo', 'vuelos', 'avion', 'avión', 'pasaje', 'pasajes', 'aeropuerto'],
    emojis: ['✈️', '🎫', '🧳'],
    expansions: ['airplane', 'ticket', 'luggage'],
  },
  {
    aliases: ['hotel', 'hostal', 'airbnb', 'hospedaje', 'alojamiento', 'posada'],
    emojis: ['🏨', '🛏️', '🧳'],
    expansions: ['hotel', 'bed', 'luggage'],
  },
  {
    aliases: ['arriendo', 'renta', 'alquiler', 'canon', 'apartamento', 'depa', 'depto', 'pieza'],
    emojis: ['🏠', '🏢'],
    expansions: ['house', 'apartment'],
  },
  {
    aliases: ['luz', 'electricidad', 'corriente', 'energia', 'energía', 'epm', 'codensa', 'edesur', 'edenor', 'cfe'],
    emojis: ['💡', '⚡'],
    expansions: ['light', 'electricity'],
  },
  {
    aliases: ['agua servicio', 'acueducto', 'alcantarillado', 'sedapal', 'aysa'],
    emojis: ['💧', '🚰'],
    expansions: ['water'],
  },
  {
    aliases: ['gas natural', 'gas servicio', 'metrogas', 'calidda', 'calidda gas'],
    emojis: ['🔥', '🏠'],
    expansions: ['fire'],
  },
  {
    aliases: ['internet', 'wifi', 'fibra', 'fibra optica', 'fibra óptica', 'modem', 'módem', 'router'],
    emojis: ['📶', '🛜', '💻'],
    expansions: ['wifi', 'computer'],
  },
  {
    aliases: ['celular', 'telefono', 'teléfono', 'movil', 'móvil', 'recarga', 'plan celular', 'sim', 'chip', 'datos', 'tigo', 'claro', 'movistar', 'wom', 'personal', 'antel', 'entel'],
    emojis: ['📱', '📲'],
    expansions: ['mobile phone', 'telephone'],
  },
  {
    aliases: ['nequi', 'daviplata', 'yape', 'plin', 'mercado pago', 'mercadopago', 'uala', 'ualá', 'nubank', 'nu', 'billetera', 'transferencia'],
    emojis: ['💳', '📲', '💸'],
    expansions: ['credit card', 'money'],
  },
  {
    aliases: ['banco', 'bancos', 'bancolombia', 'bbva', 'galicia', 'santander', 'itau', 'itaú', 'banorte', 'interbank', 'bcp'],
    emojis: ['🏦', '💳'],
    expansions: ['bank', 'credit card'],
  },
  {
    aliases: ['efectivo', 'cash', 'billete', 'billetes', 'plata', 'lana', 'guita', 'lucas', 'pesos', 'dolares', 'dólares'],
    emojis: ['💵', '💸', '💰'],
    expansions: ['cash', 'money'],
  },
  {
    aliases: ['farmacia', 'drogueria', 'droguería', 'botica', 'remedio', 'remedios', 'medicina', 'medicinas', 'pastilla', 'pastillas'],
    emojis: ['💊', '🏥', '🧴'],
    expansions: ['pill', 'hospital', 'medicine'],
  },
  {
    aliases: ['doctor', 'medico', 'médico', 'consulta', 'clinica', 'clínica', 'hospital', 'odontologo', 'odontólogo', 'dentista'],
    emojis: ['👨‍⚕️', '🏥', '🩺'],
    expansions: ['doctor', 'hospital', 'stethoscope'],
  },
  {
    aliases: ['veterinario', 'veterinaria', 'vet', 'mascota', 'mascotas'],
    emojis: ['🐾', '🐶', '🐱'],
    expansions: ['paw prints', 'dog', 'cat'],
  },
  {
    aliases: ['gatito', 'gatitos', 'gato', 'gatos', 'michi', 'michis', 'minino'],
    emojis: ['🐱', '🐈', '🐾'],
    expansions: ['cat', 'paw prints'],
  },
  {
    aliases: ['perrito', 'perritos', 'perro', 'perros', 'firulais', 'lomito', 'lomitos'],
    emojis: ['🐶', '🐕', '🐾'],
    expansions: ['dog', 'paw prints'],
  },
  {
    aliases: ['limpieza', 'aseo', 'aseo hogar', 'detergente', 'jabon', 'jabón', 'lavandina', 'cloro', 'suavizante'],
    emojis: ['🧹', '🧼', '🧴'],
    expansions: ['broom', 'soap', 'lotion'],
  },
  {
    aliases: ['ropa', 'zapatos', 'zapatillas', 'tenis', 'remera', 'camiseta', 'pantalon', 'pantalón', 'lavanderia', 'lavandería'],
    emojis: ['👕', '👟', '🧺'],
    expansions: ['shirt', 'shoe', 'basket'],
  },
  {
    aliases: ['cine', 'pelicula', 'película', 'pelis', 'netflix', 'disney', 'spotify', 'streaming'],
    emojis: ['🎬', '🍿', '🎵'],
    expansions: ['movie', 'popcorn', 'music'],
  },
  {
    aliases: ['fiesta', 'rumba', 'carrete', 'joda', 'antro', 'boliche', 'bar', 'bares', 'discoteca'],
    emojis: ['🎉', '🍻', '🪩'],
    expansions: ['party', 'beer', 'mirror ball'],
  },
  {
    aliases: ['regalo', 'regalos', 'cumple', 'cumpleanos', 'cumpleaños', 'detalle'],
    emojis: ['🎁', '🎂', '🎉'],
    expansions: ['gift', 'birthday', 'party'],
  },
  {
    aliases: ['viaje', 'viajes', 'turismo', 'turistear', 'vacacion', 'vacación', 'vacaciones', 'paseo', 'paseos', 'escapada', 'tour'],
    emojis: ['🧳', '✈️', '🗺️'],
    expansions: ['luggage', 'airplane', 'map'],
  },
  {
    aliases: ['maleta', 'maletas', 'equipaje', 'valija', 'valijas', 'mochila', 'morral', 'morralito'],
    emojis: ['🧳', '🎒'],
    expansions: ['luggage', 'backpack'],
  },
  {
    aliases: ['pasaporte', 'visa', 'visado', 'migracion', 'migración', 'aduana', 'documentos viaje'],
    emojis: ['🛂', '📘', '✈️'],
    expansions: ['passport control', 'book', 'airplane'],
  },
  {
    aliases: ['playa', 'balneario', 'mar', 'costa', 'caribe', 'isla', 'islas', 'bronceador', 'bloqueador', 'protector solar'],
    emojis: ['🏖️', '🌊', '☀️'],
    expansions: ['beach', 'ocean', 'sun'],
  },
  {
    aliases: ['montana', 'montaña', 'cerro', 'sendero', 'trekking', 'hiking', 'caminata', 'camping', 'acampar', 'carpa'],
    emojis: ['⛰️', '🥾', '🏕️'],
    expansions: ['mountain', 'hiking boot', 'camping'],
  },
  {
    aliases: ['museo', 'museos', 'galeria', 'galería', 'exposicion', 'exposición', 'teatro', 'concierto', 'show', 'entrada', 'entradas'],
    emojis: ['🎟️', '🎭', '🏛️'],
    expansions: ['ticket', 'theater', 'museum'],
  },
  {
    aliases: ['renta carro', 'alquiler auto', 'alquiler carro', 'rentacar', 'rentar auto', 'rentar carro'],
    emojis: ['🚗', '🔑', '🧾'],
    expansions: ['car', 'key', 'receipt'],
  },
  {
    aliases: ['lancha', 'bote', 'barco', 'ferry', 'catamaran', 'catamarán'],
    emojis: ['⛴️', '🚤', '⚓'],
    expansions: ['ferry', 'boat', 'anchor'],
  },
  {
    aliases: ['seguro', 'seguros', 'seguro medico', 'seguro médico', 'seguro viaje', 'poliza', 'póliza', 'aseguradora'],
    emojis: ['🛡️', '📄', '🏥'],
    expansions: ['shield', 'document', 'hospital'],
  },
  {
    aliases: ['impuesto', 'impuestos', 'renta impuesto', 'predial', 'vehicular', 'iva', 'afip', 'sat', 'dian', 'sunat', 'sii', 'seniat'],
    emojis: ['🏛️', '🧾', '💸'],
    expansions: ['classical building', 'receipt', 'money'],
  },
  {
    aliases: ['tramite', 'trámite', 'tramites', 'trámites', 'notaria', 'notaría', 'registro', 'licencia', 'cedula', 'cédula', 'dni', 'rut', 'curp'],
    emojis: ['📄', '🪪', '🏛️'],
    expansions: ['document', 'identification card', 'building'],
  },
  {
    aliases: ['multa', 'multas', 'comparendo', 'fotomulta', 'infraccion', 'infracción', 'grua', 'grúa'],
    emojis: ['🚨', '🧾', '🚗'],
    expansions: ['police car light', 'receipt', 'car'],
  },
  {
    aliases: ['colegio', 'escuela', 'universidad', 'facultad', 'matricula', 'matrícula', 'pension colegio', 'pensión colegio', 'mensualidad colegio'],
    emojis: ['🎓', '🏫', '📚'],
    expansions: ['graduation cap', 'school', 'books'],
  },
  {
    aliases: ['curso', 'cursos', 'clase', 'clases', 'taller', 'capacitacion', 'capacitación', 'diplomado', 'maestria', 'maestría'],
    emojis: ['📚', '💻', '🎓'],
    expansions: ['books', 'laptop', 'graduation cap'],
  },
  {
    aliases: ['libro', 'libros', 'cuaderno', 'cuadernos', 'utiles', 'útiles', 'papeleria', 'papelería', 'lapiz', 'lápiz', 'lapices', 'lápices'],
    emojis: ['📚', '✏️', '📓'],
    expansions: ['books', 'pencil', 'notebook'],
  },
  {
    aliases: ['guarderia', 'guardería', 'jardin', 'jardín', 'nino', 'niño', 'nina', 'niña', 'hijo', 'hija', 'baby', 'bebe', 'bebé'],
    emojis: ['👶', '🧸', '🍼'],
    expansions: ['baby', 'teddy bear', 'baby bottle'],
  },
  {
    aliases: ['panal', 'pañal', 'panales', 'pañales', 'toallitas', 'formula bebe', 'fórmula bebé', 'leche bebe', 'leche bebé'],
    emojis: ['👶', '🍼', '🧻'],
    expansions: ['baby', 'baby bottle', 'paper'],
  },
  {
    aliases: ['juguete', 'juguetes', 'muneco', 'muñeco', 'muneca', 'muñeca', 'lego', 'peluche'],
    emojis: ['🧸', '🪀', '🎲'],
    expansions: ['teddy bear', 'yo-yo', 'game die'],
  },
  {
    aliases: ['gimnasio', 'gym', 'entreno', 'entrenamiento', 'deporte', 'deportes', 'cancha', 'club', 'mensualidad gym'],
    emojis: ['🏋️', '💪', '🎽'],
    expansions: ['weight lifting', 'muscle', 'running shirt'],
  },
  {
    aliases: ['futbol', 'fútbol', 'fulbito', 'futsal', 'cancha futbol', 'pelota futbol', 'partido futbol'],
    emojis: ['⚽', '🥅', '🏟️'],
    expansions: ['soccer ball', 'goal net', 'stadium'],
  },
  {
    aliases: ['basquet', 'básquet', 'basket', 'baloncesto'],
    emojis: ['🏀'],
    expansions: ['basketball'],
  },
  {
    aliases: ['tenis deporte', 'padel', 'pádel', 'raqueta'],
    emojis: ['🎾', '🏸'],
    expansions: ['tennis', 'badminton'],
  },
  {
    aliases: ['peluqueria', 'peluquería', 'barberia', 'barbería', 'barbero', 'corte pelo', 'corte de pelo', 'salon', 'salón'],
    emojis: ['💇', '✂️', '🪒'],
    expansions: ['haircut', 'scissors', 'razor'],
  },
  {
    aliases: ['unas', 'uñas', 'manicure', 'manicura', 'pedicure', 'pedicura', 'esmalte'],
    emojis: ['💅', '🧴'],
    expansions: ['nail polish', 'lotion'],
  },
  {
    aliases: ['maquillaje', 'cosmeticos', 'cosméticos', 'skincare', 'crema', 'cremas', 'perfume', 'perfumes'],
    emojis: ['💄', '🧴', '🪞'],
    expansions: ['lipstick', 'lotion', 'mirror'],
  },
  {
    aliases: ['spa', 'masaje', 'masajes', 'facial', 'relajacion', 'relajación'],
    emojis: ['💆', '🧖', '🕯️'],
    expansions: ['massage', 'sauna', 'candle'],
  },
  {
    aliases: ['terapia', 'psicologo', 'psicólogo', 'psicologia', 'psicología', 'psiquiatra', 'salud mental'],
    emojis: ['🧠', '🛋️', '🏥'],
    expansions: ['brain', 'couch', 'hospital'],
  },
  {
    aliases: ['laboratorio', 'examenes', 'exámenes', 'analisis', 'análisis', 'sangre', 'radiografia', 'radiografía', 'ecografia', 'ecografía'],
    emojis: ['🧪', '🩸', '🏥'],
    expansions: ['test tube', 'blood', 'hospital'],
  },
  {
    aliases: ['lentes', 'gafas', 'anteojos', 'optica', 'óptica', 'oftalmologo', 'oftalmólogo'],
    emojis: ['👓', '🕶️', '👁️'],
    expansions: ['glasses', 'sunglasses', 'eye'],
  },
  {
    aliases: ['mascota comida', 'comida perro', 'comida gato', 'concentrado', 'croquetas', 'purina', 'arena gato', 'arena sanitaria'],
    emojis: ['🐾', '🐱', '🐶'],
    expansions: ['paw prints', 'cat', 'dog'],
  },
  {
    aliases: ['paseador', 'paseador perro', 'guarderia canina', 'guardería canina', 'peluqueria canina', 'peluquería canina'],
    emojis: ['🐕', '🦮', '🐾'],
    expansions: ['dog', 'guide dog', 'paw prints'],
  },
  {
    aliases: ['mueble', 'muebles', 'sofa', 'sofá', 'sillon', 'sillón', 'mesa', 'silla', 'colchon', 'colchón', 'cama'],
    emojis: ['🛋️', '🪑', '🛏️'],
    expansions: ['couch', 'chair', 'bed'],
  },
  {
    aliases: ['ferreteria', 'ferretería', 'herramienta', 'herramientas', 'tornillo', 'martillo', 'taladro', 'pintura hogar'],
    emojis: ['🔨', '🪛', '🧰'],
    expansions: ['hammer', 'screwdriver', 'toolbox'],
  },
  {
    aliases: ['reparacion', 'reparación', 'arreglo', 'arreglos', 'plomero', 'gasfiter', 'gasfitero', 'electricista', 'tecnico', 'técnico'],
    emojis: ['🛠️', '🔧', '🏠'],
    expansions: ['tools', 'wrench', 'house'],
  },
  {
    aliases: ['jardin', 'jardín', 'plantas', 'planta', 'matera', 'maceta', 'abono', 'vivero'],
    emojis: ['🪴', '🌱', '🌿'],
    expansions: ['potted plant', 'seedling', 'herb'],
  },
  {
    aliases: ['seguridad', 'alarma', 'camara seguridad', 'cámara seguridad', 'vigilancia', 'portería', 'porteria', 'administracion edificio', 'administración edificio'],
    emojis: ['🔐', '📹', '🏢'],
    expansions: ['lock', 'camera', 'office building'],
  },
  {
    aliases: ['condominio', 'consorcio', 'expensas', 'administracion', 'administración', 'mantenimiento edificio'],
    emojis: ['🏢', '🧾', '🛠️'],
    expansions: ['office building', 'receipt', 'tools'],
  },
  {
    aliases: ['suscripcion', 'suscripción', 'mensualidad', 'membresia', 'membresía', 'app pago', 'icloud', 'google one', 'dropbox', 'canva', 'chatgpt'],
    emojis: ['📱', '💳', '🔁'],
    expansions: ['mobile phone', 'credit card', 'repeat'],
  },
  {
    aliases: ['telefono fijo', 'telefonia', 'telefonía', 'cable', 'television', 'televisión', 'tv cable', 'directv', 'claro tv'],
    emojis: ['📺', '☎️', '📡'],
    expansions: ['television', 'telephone', 'satellite'],
  },
  {
    aliases: ['videojuego', 'videojuegos', 'playstation', 'xbox', 'nintendo', 'steam', 'juego', 'juegos'],
    emojis: ['🎮', '🕹️'],
    expansions: ['video game', 'joystick'],
  },
  {
    aliases: ['celular equipo', 'telefono nuevo', 'teléfono nuevo', 'iphone', 'android', 'reparacion celular', 'reparación celular', 'pantalla celular'],
    emojis: ['📱', '🛠️', '🔋'],
    expansions: ['mobile phone', 'tools', 'battery'],
  },
  {
    aliases: ['computador', 'computadora', 'pc', 'laptop', 'notebook', 'teclado', 'mouse', 'monitor', 'impresora'],
    emojis: ['💻', '⌨️', '🖨️'],
    expansions: ['laptop', 'keyboard', 'printer'],
  },
  {
    aliases: ['regalo mama', 'regalo mamá', 'regalo papa', 'regalo papá', 'dia madre', 'día madre', 'dia padre', 'día padre', 'navidad', 'amigo secreto'],
    emojis: ['🎁', '🎄', '💝'],
    expansions: ['gift', 'christmas tree', 'heart'],
  },
  {
    aliases: ['donacion', 'donación', 'donaciones', 'iglesia', 'caridad', 'colecta', 'propina', 'propinas'],
    emojis: ['🤝', '💝', '💸'],
    expansions: ['handshake', 'heart', 'money'],
  },
  {
    aliases: ['ahorro', 'ahorros', 'inversion', 'inversión', 'inversiones', 'bolsa', 'cripto', 'crypto', 'bitcoin'],
    emojis: ['💰', '📈', '🪙'],
    expansions: ['money bag', 'chart increasing', 'coin'],
  },
  {
    aliases: ['deuda', 'deudas', 'prestamo', 'préstamo', 'credito', 'crédito', 'cuota', 'cuotas', 'hipoteca'],
    emojis: ['💸', '🏦', '🧾'],
    expansions: ['money', 'bank', 'receipt'],
  },
  {
    aliases: ['envio', 'envío', 'envios', 'envíos', 'correo', 'mensajeria', 'mensajería', 'paquete', 'paqueteria', 'paquetería'],
    emojis: ['📦', '🚚', '✉️'],
    expansions: ['package', 'truck', 'envelope'],
  },
  {
    aliases: ['mudanza', 'trasteo', 'flete', 'camion mudanza', 'camión mudanza'],
    emojis: ['🚚', '📦', '🏠'],
    expansions: ['truck', 'package', 'house'],
  },
  {
    aliases: ['lavado carro', 'lavadero', 'autolavado', 'carwash', 'mecanico', 'mecánico', 'taller auto', 'aceite auto', 'llanta', 'llantas'],
    emojis: ['🚗', '🧽', '🔧'],
    expansions: ['car', 'sponge', 'wrench'],
  },
  {
    aliases: ['mercado campesino', 'feria', 'feria libre', 'verduleria', 'verdulería', 'fruteria', 'frutería', 'carniceria', 'carnicería', 'pescaderia', 'pescadería'],
    emojis: ['🧺', '🥬', '🥩'],
    expansions: ['basket', 'vegetable', 'meat'],
  },
  {
    aliases: ['kiosco', 'quiosco', 'tiendita', 'oxxo', 'kiosko', 'minimarket', 'mini market'],
    emojis: ['🏪', '🥤', '🍪'],
    expansions: ['convenience store', 'soft drink', 'cookie'],
  },
] as const

/**
 * Conceptos ES/LATAM → emojis ordenados por relevancia.
 * Cubre huecos del CLDR (p.ej. no existe emoji "barbacoa" ni "mandado").
 */
export const EMOJI_CONCEPT_ALIASES: Record<string, readonly string[]> = {}

for (const group of CONCEPT_GROUPS) {
  for (const alias of group.aliases) {
    EMOJI_CONCEPT_ALIASES[normalizeItemSearchText(alias)] = group.emojis
  }
}

/** Términos CLDR (EN/ES) para expandir búsqueda cuando el concepto no está en el índice. */
export const EMOJI_CONCEPT_EXPANSIONS: Record<string, readonly string[]> = {}

for (const group of CONCEPT_GROUPS) {
  if (!group.expansions) continue
  for (const alias of group.aliases) {
    EMOJI_CONCEPT_EXPANSIONS[normalizeItemSearchText(alias)] = group.expansions
  }
}

const CONCEPT_PREFIX_MIN_CHARS = 3

export function conceptAliasMatchesQuery(query: string, alias: string): boolean {
  const normalizedQuery = normalizeItemSearchText(query.trim())
  if (normalizedQuery.length < CONCEPT_PREFIX_MIN_CHARS) return false

  const normalizedAlias = normalizeItemSearchText(alias)
  if (normalizedAlias === normalizedQuery) return true
  if (normalizedAlias.startsWith(normalizedQuery)) return true

  const queryTokens = tokenizeSearchQuery(normalizedQuery)
  if (queryTokens.length === 0) return false
  if (queryTokens.some((token) => token.length < CONCEPT_PREFIX_MIN_CHARS)) return false

  const aliasTokens = tokenizeSearchQuery(normalizedAlias)
  return queryTokens.every((queryToken) =>
    aliasTokens.some((aliasToken) => aliasToken.startsWith(queryToken))
  )
}

export function lookupEmojiConcept(query: string): string | null {
  const key = normalizeItemSearchText(query.trim())
  const exact = EMOJI_CONCEPT_ALIASES[key]?.[0]
  if (exact) return exact

  const prefixHit = Object.entries(EMOJI_CONCEPT_ALIASES).find(([alias]) =>
    conceptAliasMatchesQuery(key, alias)
  )
  return prefixHit?.[1][0] ?? null
}

export function collectConceptKeys(query: string): string[] {
  const keys = new Set<string>()
  const normalized = normalizeItemSearchText(query.trim())
  if (normalized) keys.add(normalized)

  for (const token of tokenizeSearchQuery(query)) {
    keys.add(token)
    for (const variant of searchWordVariants(token)) keys.add(variant)
  }

  return [...keys]
}
