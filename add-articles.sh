#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/ai-nova || exit 1

echo "📝 AI NOVA — ADD 12 PROFESSIONAL ARTICLES (multilingual)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("assets/app.js")
s = p.read_text()

new_articles = '''
,
{
id:"ai-hallucinations",
tag:"AI",
content:{
en:{title:"Understanding AI hallucinations and how to reduce them",text:"Why AI models sometimes generate confident but incorrect answers, and practical ways to catch it.",body:"AI hallucinations happen when a model generates information that sounds plausible but is factually wrong. This is not a bug in the traditional sense — it is a natural consequence of how language models predict text based on patterns rather than verified facts.\\n\\nTo reduce the impact of hallucinations, always verify specific facts, dates and figures against a reliable source before relying on them. Asking the model to cite sources, breaking complex questions into smaller steps, and cross-checking critical outputs are simple habits that significantly improve reliability."},
ar:{title:"فهم هلوسة الذكاء الاصطناعي وكيفية تقليلها",text:"لماذا تولّد نماذج الذكاء الاصطناعي أحياناً إجابات واثقة لكنها غير صحيحة، وطرق عملية لاكتشاف ذلك.",body:"تحدث هلوسة الذكاء الاصطناعي عندما يولّد النموذج معلومة تبدو منطقية لكنها خاطئة من الناحية الواقعية. هذا ليس خللاً بالمعنى التقليدي، بل نتيجة طبيعية لطريقة عمل نماذج اللغة التي تتنبأ بالنص بناءً على الأنماط لا على حقائق مؤكدة.\\n\\nلتقليل تأثير الهلوسة، تحقق دائماً من الحقائق والتواريخ والأرقام المحددة عبر مصدر موثوق قبل الاعتماد عليها. كما أن طلب مصادر من النموذج، وتقسيم الأسئلة المعقدة إلى خطوات أصغر، والتحقق المتقاطع من المخرجات المهمة، عادات بسيطة تحسّن الموثوقية بشكل كبير."},
fr:{title:"Comprendre les hallucinations de l'IA et comment les réduire",text:"Pourquoi les modèles IA génèrent parfois des réponses confiantes mais incorrectes, et des moyens pratiques pour les détecter.",body:"Les hallucinations de l'IA surviennent lorsqu'un modèle génère une information qui semble plausible mais qui est factuellement fausse. Ce n'est pas un bug au sens traditionnel, mais une conséquence naturelle de la façon dont les modèles de langage prédisent le texte à partir de schémas plutôt que de faits vérifiés.\\n\\nPour réduire l'impact des hallucinations, vérifiez toujours les faits précis, les dates et les chiffres auprès d'une source fiable avant de vous y fier. Demander des sources au modèle, décomposer les questions complexes en étapes plus petites et recouper les résultats importants sont des habitudes simples qui améliorent nettement la fiabilité."},
es:{title:"Entender las alucinaciones de la IA y cómo reducirlas",text:"Por qué los modelos de IA a veces generan respuestas seguras pero incorrectas, y formas prácticas de detectarlo.",body:"Las alucinaciones de la IA ocurren cuando un modelo genera información que suena plausible pero es incorrecta. Esto no es un error en el sentido tradicional, sino una consecuencia natural de cómo los modelos de lenguaje predicen texto basándose en patrones y no en hechos verificados.\\n\\nPara reducir el impacto de las alucinaciones, verifica siempre datos específicos, fechas y cifras con una fuente confiable antes de confiar en ellos. Pedir fuentes al modelo, dividir preguntas complejas en pasos más pequeños y verificar de forma cruzada los resultados importantes son hábitos simples que mejoran significativamente la fiabilidad."}
}
},
{
id:"prompt-engineering-basics",
tag:"AI",
content:{
en:{title:"Prompt engineering basics for better AI results",text:"Simple techniques to get clearer, more accurate answers from any AI model.",body:"A good prompt gives the model context, a clear goal and the format you expect. Vague requests lead to vague answers, while specific instructions — including examples, constraints and the intended audience — consistently produce better results.\\n\\nBreaking a complex task into smaller prompts, asking the model to think step by step, and iterating on the wording based on the output are all techniques that professionals use daily to get more reliable and useful responses."},
ar:{title:"أساسيات هندسة التعليمات للحصول على نتائج أفضل من الذكاء الاصطناعي",text:"تقنيات بسيطة للحصول على إجابات أوضح وأدق من أي نموذج ذكاء اصطناعي.",body:"التعليمة الجيدة تمنح النموذج سياقاً وهدفاً واضحاً والشكل المتوقع للإجابة. الطلبات الغامضة تؤدي إلى إجابات غامضة، بينما التعليمات المحددة — بما فيها الأمثلة والقيود والجمهور المستهدف — تنتج نتائج أفضل باستمرار.\\n\\nتقسيم المهمة المعقدة إلى تعليمات أصغر، وطلب التفكير خطوة بخطوة من النموذج، وتعديل الصياغة بناءً على النتائج، كلها تقنيات يستخدمها المحترفون يومياً للحصول على إجابات أكثر موثوقية وفائدة."},
fr:{title:"Bases de l'ingénierie de prompt pour de meilleurs résultats IA",text:"Des techniques simples pour obtenir des réponses plus claires et précises de tout modèle IA.",body:"Un bon prompt donne au modèle du contexte, un objectif clair et le format attendu. Les demandes vagues entraînent des réponses vagues, tandis que des instructions précises — avec exemples, contraintes et public visé — produisent systématiquement de meilleurs résultats.\\n\\nDécomposer une tâche complexe en prompts plus petits, demander au modèle de raisonner étape par étape et ajuster la formulation selon les résultats sont des techniques utilisées quotidiennement par les professionnels pour obtenir des réponses plus fiables et utiles."},
es:{title:"Fundamentos de ingeniería de prompts para mejores resultados de IA",text:"Técnicas simples para obtener respuestas más claras y precisas de cualquier modelo de IA.",body:"Un buen prompt le da al modelo contexto, un objetivo claro y el formato esperado. Las solicitudes vagas generan respuestas vagas, mientras que las instrucciones específicas —con ejemplos, restricciones y el público destinatario— producen mejores resultados de forma constante.\\n\\nDividir una tarea compleja en prompts más pequeños, pedir al modelo que razone paso a paso y ajustar la redacción según los resultados son técnicas que los profesionales usan a diario para obtener respuestas más confiables y útiles."}
}
},
{
id:"cloud-vs-ondevice-ai",
tag:"AI",
content:{
en:{title:"Choosing between cloud AI and on-device AI",text:"What to consider when deciding where an AI feature should actually run.",body:"Cloud-based AI offers more processing power and access to larger models, making it suitable for complex tasks. On-device AI, on the other hand, works offline, responds faster and keeps data local, which matters for privacy-sensitive use cases.\\n\\nThe right choice depends on the task: quick, private, everyday interactions often work well on-device, while research-heavy or highly complex requests usually benefit from cloud processing."},
ar:{title:"الاختيار بين الذكاء الاصطناعي السحابي والذكاء الاصطناعي على الجهاز",text:"ما يجب مراعاته عند تحديد أين يجب أن تعمل ميزة الذكاء الاصطناعي فعلياً.",body:"يوفر الذكاء الاصطناعي السحابي قوة معالجة أكبر ووصولاً إلى نماذج أضخم، مما يجعله مناسباً للمهام المعقدة. أما الذكاء الاصطناعي على الجهاز فيعمل دون اتصال، ويستجيب أسرع، ويبقي البيانات محلية، وهو أمر مهم في الحالات الحساسة للخصوصية.\\n\\nالاختيار الصحيح يعتمد على المهمة: التفاعلات اليومية السريعة والخاصة تعمل غالباً بشكل جيد على الجهاز، بينما الطلبات البحثية أو المعقدة جداً تستفيد عادة من المعالجة السحابية."},
fr:{title:"Choisir entre l'IA dans le cloud et l'IA embarquée",text:"Ce qu'il faut considérer pour décider où une fonctionnalité IA doit réellement s'exécuter.",body:"L'IA dans le cloud offre plus de puissance de calcul et l'accès à des modèles plus grands, ce qui la rend adaptée aux tâches complexes. L'IA embarquée, elle, fonctionne hors ligne, répond plus vite et garde les données en local, ce qui compte pour les cas sensibles à la confidentialité.\\n\\nLe bon choix dépend de la tâche : les interactions quotidiennes rapides et privées fonctionnent souvent bien en local, tandis que les demandes complexes ou nécessitant de la recherche profitent généralement du traitement cloud."},
es:{title:"Elegir entre IA en la nube e IA en el dispositivo",text:"Qué considerar al decidir dónde debe ejecutarse realmente una función de IA.",body:"La IA en la nube ofrece más potencia de procesamiento y acceso a modelos más grandes, lo que la hace adecuada para tareas complejas. La IA en el dispositivo, en cambio, funciona sin conexión, responde más rápido y mantiene los datos locales, algo importante en casos sensibles a la privacidad.\\n\\nLa elección correcta depende de la tarea: las interacciones diarias rápidas y privadas suelen funcionar bien en el dispositivo, mientras que las solicitudes complejas o de investigación se benefician normalmente del procesamiento en la nube."}
}
},
{
id:"android-battery-myths",
tag:"ANDROID",
content:{
en:{title:"Battery optimization myths and facts on Android",text:"Separating real battery-saving habits from common misconceptions.",body:"Closing apps manually does not necessarily save battery — Android is designed to manage background processes efficiently on its own. Repeatedly force-closing apps can actually use more power, since the system has to reload them from scratch each time.\\n\\nWhat genuinely helps is reducing screen brightness, limiting background data for rarely used apps, and keeping the operating system updated, since updates often include real power-management improvements."},
ar:{title:"خرافات وحقائق حول توفير طاقة البطارية في أندرويد",text:"الفصل بين عادات توفير البطارية الحقيقية والمفاهيم الخاطئة الشائعة.",body:"إغلاق التطبيقات يدوياً لا يوفر البطارية بالضرورة — فنظام أندرويد مصمم لإدارة العمليات الخلفية بكفاءة من تلقائه. إغلاق التطبيقات بالقوة بشكل متكرر قد يستهلك طاقة أكثر فعلياً، لأن النظام يضطر لإعادة تحميلها من جديد في كل مرة.\\n\\nما يساعد فعلاً هو تقليل سطوع الشاشة، والحد من البيانات الخلفية للتطبيقات نادرة الاستخدام، والحفاظ على تحديث النظام، لأن التحديثات غالباً ما تتضمن تحسينات حقيقية في إدارة الطاقة."},
fr:{title:"Mythes et réalités sur l'optimisation de la batterie Android",text:"Distinguer les vraies habitudes d'économie de batterie des idées reçues courantes.",body:"Fermer manuellement les applications n'économise pas forcément la batterie — Android est conçu pour gérer les processus en arrière-plan efficacement par lui-même. Forcer la fermeture des applications de façon répétée peut en réalité consommer plus d'énergie, car le système doit les recharger entièrement à chaque fois.\\n\\nCe qui aide réellement, c'est de réduire la luminosité de l'écran, de limiter les données en arrière-plan pour les applications peu utilisées et de garder le système à jour, les mises à jour incluant souvent de réelles améliorations de gestion d'énergie."},
es:{title:"Mitos y realidades sobre la optimización de batería en Android",text:"Separando los hábitos reales de ahorro de batería de los conceptos erróneos comunes.",body:"Cerrar aplicaciones manualmente no ahorra batería necesariamente: Android está diseñado para gestionar los procesos en segundo plano de forma eficiente por sí mismo. Forzar el cierre de apps repetidamente puede consumir incluso más energía, ya que el sistema debe recargarlas desde cero cada vez.\\n\\nLo que realmente ayuda es reducir el brillo de la pantalla, limitar los datos en segundo plano de las apps poco usadas y mantener el sistema operativo actualizado, ya que las actualizaciones suelen incluir mejoras reales en la gestión de energía."}
}
},
{
id:"android-app-permissions",
tag:"ANDROID",
content:{
en:{title:"Setting up secure app permissions on Android",text:"A practical approach to reviewing and managing what apps can access.",body:"Every permission an app requests should match its core function. A flashlight app asking for contacts access, for example, is a clear warning sign that deserves attention before granting anything.\\n\\nAndroid allows reviewing and revoking permissions at any time from Settings. Regularly auditing location, microphone, camera and contacts access — especially for apps that are rarely used — is one of the simplest ways to reduce unnecessary data exposure."},
ar:{title:"إعداد أذونات تطبيقات آمنة في أندرويد",text:"طريقة عملية لمراجعة وإدارة ما يمكن للتطبيقات الوصول إليه.",body:"يجب أن يتوافق كل إذن يطلبه التطبيق مع وظيفته الأساسية. مثلاً، طلب تطبيق مصباح يدوي الوصول إلى جهات الاتصال إشارة تحذير واضحة تستحق الانتباه قبل منح أي إذن.\\n\\nيتيح أندرويد مراجعة وإلغاء الأذونات في أي وقت من الإعدادات. مراجعة أذونات الموقع والميكروفون والكاميرا وجهات الاتصال بانتظام — خصوصاً للتطبيقات نادرة الاستخدام — واحدة من أبسط الطرق لتقليل التعرض غير الضروري للبيانات."},
fr:{title:"Configurer des permissions d'applications sécurisées sur Android",text:"Une approche pratique pour examiner et gérer ce à quoi les applications peuvent accéder.",body:"Chaque permission demandée par une application doit correspondre à sa fonction principale. Une application lampe torche demandant l'accès aux contacts, par exemple, est un signal d'alerte clair qui mérite attention avant d'accorder quoi que ce soit.\\n\\nAndroid permet de consulter et révoquer les permissions à tout moment depuis les paramètres. Vérifier régulièrement l'accès à la localisation, au micro, à la caméra et aux contacts — surtout pour les applications peu utilisées — est l'un des moyens les plus simples de réduire une exposition inutile des données."},
es:{title:"Configurar permisos de apps seguros en Android",text:"Un enfoque práctico para revisar y gestionar a qué pueden acceder las aplicaciones.",body:"Cada permiso que solicita una app debe corresponder a su función principal. Por ejemplo, que una app de linterna pida acceso a los contactos es una clara señal de alerta que merece atención antes de conceder nada.\\n\\nAndroid permite revisar y revocar permisos en cualquier momento desde los ajustes. Auditar regularmente el acceso a ubicación, micrófono, cámara y contactos —especialmente en apps poco usadas— es una de las formas más simples de reducir la exposición innecesaria de datos."}
}
},
{
id:"android-home-screen-organization",
tag:"ANDROID",
content:{
en:{title:"Best practices for organizing Android home screens",text:"A cleaner layout that reduces distraction and speeds up daily use.",body:"An overcrowded home screen slows you down and increases distraction. Keeping only the four or five most-used apps visible, with everything else organized into folders or an app drawer, creates a calmer and faster experience.\\n\\nGrouping apps by purpose — communication, productivity, media — rather than by app name, makes it easier to find what you need quickly, especially on devices with smaller screens."},
ar:{title:"أفضل الممارسات لتنظيم الشاشة الرئيسية في أندرويد",text:"تخطيط أنظف يقلل التشتت ويسرّع الاستخدام اليومي.",body:"الشاشة الرئيسية المزدحمة تبطئك وتزيد التشتت. إبقاء فقط أربعة أو خمسة تطبيقات الأكثر استخداماً ظاهرة، مع تنظيم الباقي في مجلدات أو درج التطبيقات، يخلق تجربة أهدأ وأسرع.\\n\\nتجميع التطبيقات حسب الغرض — تواصل، إنتاجية، وسائط — بدلاً من اسم التطبيق، يسهّل إيجاد ما تحتاجه بسرعة، خصوصاً على الأجهزة ذات الشاشات الأصغر."},
fr:{title:"Bonnes pratiques pour organiser l'écran d'accueil Android",text:"Une mise en page plus claire qui réduit les distractions et accélère l'usage quotidien.",body:"Un écran d'accueil surchargé ralentit et augmente les distractions. Ne garder visibles que les quatre ou cinq applications les plus utilisées, en organisant le reste en dossiers ou dans le tiroir d'applications, crée une expérience plus calme et plus rapide.\\n\\nRegrouper les applications par usage — communication, productivité, médias — plutôt que par nom, facilite l'accès rapide à ce dont vous avez besoin, surtout sur les écrans plus petits."},
es:{title:"Buenas prácticas para organizar la pantalla de inicio en Android",text:"Un diseño más limpio que reduce las distracciones y agiliza el uso diario.",body:"Una pantalla de inicio saturada te ralentiza y aumenta la distracción. Mantener visibles solo las cuatro o cinco apps más usadas, organizando el resto en carpetas o en el cajón de aplicaciones, crea una experiencia más tranquila y rápida.\\n\\nAgrupar las apps por propósito —comunicación, productividad, multimedia— en lugar de por nombre, facilita encontrar lo que necesitas rápidamente, especialmente en pantallas más pequeñas."}
}
},
{
id:"clear-documentation-guide",
tag:"GUIDE",
content:{
en:{title:"How to write clear documentation for any project",text:"A structure that makes technical and non-technical writing easier to follow.",body:"Good documentation starts with the reader's goal, not the writer's process. State clearly what the reader will be able to do after reading, then organize the content in the order they will actually need it.\\n\\nShort paragraphs, concrete examples and consistent terminology matter more than exhaustive detail. A document that answers the most common questions quickly is more valuable than one that tries to cover every edge case up front."},
ar:{title:"كيف تكتب توثيقاً واضحاً لأي مشروع",text:"بنية تجعل الكتابة التقنية وغير التقنية أسهل للمتابعة.",body:"التوثيق الجيد يبدأ من هدف القارئ لا من عملية الكاتب. وضّح بشكل واضح ما سيتمكن القارئ من فعله بعد القراءة، ثم رتّب المحتوى بالترتيب الذي سيحتاجه فعلياً.\\n\\nالفقرات القصيرة والأمثلة الملموسة والمصطلحات المتسقة أهم من التفاصيل الشاملة. المستند الذي يجيب بسرعة عن الأسئلة الأكثر شيوعاً أكثر فائدة من مستند يحاول تغطية كل حالة استثنائية منذ البداية."},
fr:{title:"Comment rédiger une documentation claire pour tout projet",text:"Une structure qui rend l'écriture technique et non technique plus facile à suivre.",body:"Une bonne documentation part de l'objectif du lecteur, pas du processus de l'auteur. Indiquez clairement ce que le lecteur pourra faire après la lecture, puis organisez le contenu dans l'ordre où il en aura réellement besoin.\\n\\nDes paragraphes courts, des exemples concrets et une terminologie cohérente comptent plus que des détails exhaustifs. Un document qui répond rapidement aux questions les plus courantes est plus utile qu'un document qui tente de couvrir tous les cas particuliers d'emblée."},
es:{title:"Cómo escribir documentación clara para cualquier proyecto",text:"Una estructura que facilita seguir la escritura técnica y no técnica.",body:"Una buena documentación parte del objetivo del lector, no del proceso del autor. Indica claramente qué podrá hacer el lector después de leer, y luego organiza el contenido en el orden en que realmente lo necesitará.\\n\\nLos párrafos cortos, los ejemplos concretos y la terminología consistente importan más que el detalle exhaustivo. Un documento que responde rápido a las preguntas más comunes es más valioso que uno que intenta cubrir todos los casos especiales desde el principio."}
}
},
{
id:"content-calendar-system",
tag:"GUIDE",
content:{
en:{title:"A simple content calendar system for consistent publishing",text:"A lightweight planning method that keeps publishing steady without burnout.",body:"Consistency matters more than volume. A simple calendar with one column for topics, one for status and one for publish date is enough to keep a small content operation organized without heavy tools.\\n\\nBatching similar tasks — research one week, writing the next, editing after that — reduces context-switching and makes it realistic to sustain a publishing schedule over the long term."},
ar:{title:"نظام تقويم محتوى بسيط للنشر المنتظم",text:"طريقة تخطيط خفيفة تحافظ على انتظام النشر دون إرهاق.",body:"الانتظام أهم من الكمية. تقويم بسيط بعمود للمواضيع، وعمود للحالة، وعمود لتاريخ النشر كافٍ للحفاظ على تنظيم عملية محتوى صغيرة دون أدوات ثقيلة.\\n\\nتجميع المهام المتشابهة — بحث في أسبوع، كتابة في التالي، تحرير بعده — يقلل تبديل السياق الذهني ويجعل الحفاظ على جدول نشر مستدام على المدى الطويل أمراً واقعياً."},
fr:{title:"Un système simple de calendrier éditorial pour publier régulièrement",text:"Une méthode de planification légère qui maintient une publication régulière sans épuisement.",body:"La régularité compte plus que le volume. Un calendrier simple avec une colonne pour les sujets, une pour le statut et une pour la date de publication suffit à organiser une petite activité éditoriale sans outils lourds.\\n\\nRegrouper les tâches similaires — recherche une semaine, rédaction la suivante, relecture ensuite — réduit les changements de contexte et rend réaliste le maintien d'un rythme de publication sur le long terme."},
es:{title:"Un sistema simple de calendario de contenido para publicar de forma constante",text:"Un método de planificación ligero que mantiene una publicación estable sin agotamiento.",body:"La constancia importa más que el volumen. Un calendario simple con una columna para temas, otra para el estado y otra para la fecha de publicación es suficiente para mantener organizada una operación de contenido pequeña sin herramientas complejas.\\n\\nAgrupar tareas similares —investigación una semana, redacción la siguiente, edición después— reduce el cambio de contexto y hace realista mantener un ritmo de publicación a largo plazo."}
}
},
{
id:"evaluate-online-tools",
tag:"GUIDE",
content:{
en:{title:"How to evaluate any online tool before adopting it",text:"A short checklist to avoid switching tools every few months.",body:"Before adopting a new tool, define the specific problem it needs to solve and check whether it actually solves that problem better than your current process — not just whether it looks appealing.\\n\\nCheck data export options, pricing changes over time, and how actively the tool is maintained. A tool that is hard to leave later is a bigger risk than one that simply lacks a feature today."},
ar:{title:"كيف تقيّم أي أداة رقمية قبل اعتمادها",text:"قائمة تحقق قصيرة لتجنب تغيير الأدوات كل بضعة أشهر.",body:"قبل اعتماد أداة جديدة، حدّد المشكلة المحددة التي يجب أن تحلها، وتحقق مما إذا كانت تحلها فعلاً بشكل أفضل من عمليتك الحالية — لا مجرد كونها تبدو جذابة.\\n\\nتحقق من خيارات تصدير البيانات، وتغيّر الأسعار مع الوقت، ومدى نشاط صيانة الأداة. الأداة التي يصعب مغادرتها لاحقاً خطر أكبر من أداة تفتقر ببساطة إلى ميزة اليوم."},
fr:{title:"Comment évaluer un outil en ligne avant de l'adopter",text:"Une courte checklist pour éviter de changer d'outil tous les quelques mois.",body:"Avant d'adopter un nouvel outil, définissez le problème précis qu'il doit résoudre et vérifiez s'il le résout réellement mieux que votre processus actuel — pas seulement s'il paraît attrayant.\\n\\nVérifiez les options d'export des données, l'évolution des prix dans le temps et le niveau de maintenance de l'outil. Un outil difficile à quitter plus tard représente un risque plus grand qu'un outil qui manque simplement d'une fonctionnalité aujourd'hui."},
es:{title:"Cómo evaluar cualquier herramienta en línea antes de adoptarla",text:"Una breve lista de verificación para evitar cambiar de herramienta cada pocos meses.",body:"Antes de adoptar una nueva herramienta, define el problema específico que debe resolver y verifica si realmente lo resuelve mejor que tu proceso actual, no solo si parece atractiva.\\n\\nRevisa las opciones de exportación de datos, los cambios de precio con el tiempo y qué tan activamente se mantiene la herramienta. Una herramienta difícil de abandonar después es un riesgo mayor que una que simplemente carezca de una función hoy."}
}
},
{
id:"two-factor-authentication",
tag:"SECURITY",
content:{
en:{title:"Two-factor authentication: why it matters and how to set it up",text:"An extra layer of protection that stops most account takeovers.",body:"Two-factor authentication requires a second proof of identity beyond a password, such as a code from an app or a physical security key. This means that even if a password leaks, an attacker still cannot access the account without that second factor.\\n\\nAuthenticator apps are generally more secure than SMS codes, since text messages can be intercepted through SIM-swapping attacks. Enabling two-factor authentication on email and financial accounts first offers the highest immediate protection."},
ar:{title:"المصادقة الثنائية: لماذا تهم وكيف تفعّلها",text:"طبقة حماية إضافية توقف معظم محاولات اختراق الحسابات.",body:"تتطلب المصادقة الثنائية إثباتاً ثانياً للهوية إلى جانب كلمة المرور، مثل رمز من تطبيق أو مفتاح أمان فعلي. هذا يعني أنه حتى لو تسربت كلمة المرور، لن يتمكن المهاجم من الوصول إلى الحساب دون هذا العامل الثاني.\\n\\nتطبيقات المصادقة عادة أكثر أماناً من رموز الرسائل النصية، لأن الرسائل يمكن اعتراضها عبر هجمات تبديل شريحة الاتصال. تفعيل المصادقة الثنائية على البريد الإلكتروني والحسابات المالية أولاً يوفر أعلى حماية فورية."},
fr:{title:"Authentification à deux facteurs : pourquoi c'est important et comment l'activer",text:"Une couche de protection supplémentaire qui bloque la plupart des prises de contrôle de compte.",body:"L'authentification à deux facteurs exige une seconde preuve d'identité en plus du mot de passe, comme un code d'une application ou une clé de sécurité physique. Ainsi, même si un mot de passe fuite, un attaquant ne peut pas accéder au compte sans ce second facteur.\\n\\nLes applications d'authentification sont généralement plus sûres que les codes par SMS, ceux-ci pouvant être interceptés via des attaques de type SIM-swapping. Activer l'authentification à deux facteurs sur l'e-mail et les comptes financiers en priorité offre la meilleure protection immédiate."},
es:{title:"Autenticación de dos factores: por qué importa y cómo activarla",text:"Una capa extra de protección que detiene la mayoría de los robos de cuentas.",body:"La autenticación de dos factores exige una segunda prueba de identidad además de la contraseña, como un código de una app o una llave de seguridad física. Esto significa que, aunque se filtre una contraseña, un atacante no podrá acceder a la cuenta sin ese segundo factor.\\n\\nLas apps de autenticación suelen ser más seguras que los códigos por SMS, ya que los mensajes de texto pueden interceptarse mediante ataques de intercambio de SIM. Activar la autenticación de dos factores primero en el correo y las cuentas financieras ofrece la mayor protección inmediata."}
}
},
{
id:"recognizing-phishing",
tag:"SECURITY",
content:{
en:{title:"Recognizing phishing attempts in emails and messages",text:"Common warning signs that reveal a fraudulent message before it's too late.",body:"Phishing messages often create urgency, asking you to act immediately to avoid a penalty or claim a reward. Legitimate organizations rarely pressure users into instant action through email.\\n\\nChecking the actual sender address rather than the display name, hovering over links before clicking, and never entering credentials through a link received by email are simple habits that block the vast majority of phishing attempts."},
ar:{title:"التعرف على محاولات التصيد في الرسائل الإلكترونية والنصية",text:"علامات تحذير شائعة تكشف الرسالة الاحتيالية قبل فوات الأوان.",body:"غالباً ما تخلق رسائل التصيد شعوراً بالإلحاح، وتطلب التصرف فوراً لتجنب عقوبة أو الحصول على مكافأة. المؤسسات الحقيقية نادراً ما تضغط على المستخدمين لاتخاذ إجراء فوري عبر البريد الإلكتروني.\\n\\nالتحقق من عنوان المرسل الفعلي بدلاً من الاسم الظاهر، وتمرير المؤشر فوق الروابط قبل النقر، وعدم إدخال بيانات الدخول أبداً عبر رابط مستلم بالبريد، عادات بسيطة توقف الغالبية العظمى من محاولات التصيد."},
fr:{title:"Reconnaître les tentatives de phishing dans les e-mails et messages",text:"Des signes d'alerte courants qui révèlent un message frauduleux avant qu'il ne soit trop tard.",body:"Les messages de phishing créent souvent un sentiment d'urgence, demandant d'agir immédiatement pour éviter une pénalité ou obtenir une récompense. Les organisations légitimes pressent rarement les utilisateurs d'agir instantanément par e-mail.\\n\\nVérifier l'adresse réelle de l'expéditeur plutôt que le nom affiché, survoler les liens avant de cliquer, et ne jamais saisir d'identifiants via un lien reçu par e-mail sont des habitudes simples qui bloquent la grande majorité des tentatives de phishing."},
es:{title:"Reconocer intentos de phishing en correos y mensajes",text:"Señales de alerta comunes que revelan un mensaje fraudulento antes de que sea tarde.",body:"Los mensajes de phishing suelen crear urgencia, pidiendo actuar de inmediato para evitar una penalización u obtener una recompensa. Las organizaciones legítimas rara vez presionan a los usuarios para actuar instantáneamente por correo electrónico.\\n\\nVerificar la dirección real del remitente en lugar del nombre mostrado, pasar el cursor sobre los enlaces antes de hacer clic, y nunca introducir credenciales a través de un enlace recibido por correo son hábitos simples que bloquean la gran mayoría de los intentos de phishing."}
}
},
{
id:"password-manager-basics",
tag:"SECURITY",
content:{
en:{title:"Password manager basics: what to look for",text:"Why reusing passwords is risky and how a password manager solves it.",body:"Reusing the same password across multiple sites means that a single data breach can expose every account using that password. A password manager generates and stores a unique, strong password for each account automatically.\\n\\nWhen choosing a password manager, look for strong encryption, cross-device syncing, and a clear policy on what happens to your data if the company is acquired or shuts down. A local master password that only you know remains the foundation of the entire system's security."},
ar:{title:"أساسيات مدير كلمات المرور: ما الذي يجب البحث عنه",text:"لماذا تعتبر إعادة استخدام كلمات المرور خطيرة وكيف يحل مدير كلمات المرور المشكلة.",body:"إعادة استخدام نفس كلمة المرور عبر مواقع متعددة تعني أن اختراقاً واحداً للبيانات قد يكشف كل حساب يستخدم تلك الكلمة. مدير كلمات المرور يولّد ويخزّن كلمة مرور فريدة وقوية لكل حساب تلقائياً.\\n\\nعند اختيار مدير كلمات مرور، ابحث عن تشفير قوي، ومزامنة بين الأجهزة، وسياسة واضحة بشأن مصير بياناتك إذا استُحوذت الشركة أو أُغلقت. كلمة المرور الرئيسية المحلية التي لا يعرفها سواك تبقى أساس أمان النظام بأكمله."},
fr:{title:"Bases des gestionnaires de mots de passe : que rechercher",text:"Pourquoi réutiliser des mots de passe est risqué et comment un gestionnaire résout ce problème.",body:"Réutiliser le même mot de passe sur plusieurs sites signifie qu'une seule fuite de données peut exposer tous les comptes utilisant ce mot de passe. Un gestionnaire de mots de passe génère et stocke automatiquement un mot de passe unique et fort pour chaque compte.\\n\\nLors du choix d'un gestionnaire, recherchez un chiffrement solide, une synchronisation multi-appareils et une politique claire sur le devenir de vos données si l'entreprise est rachetée ou ferme. Un mot de passe maître local que vous seul connaissez reste le fondement de la sécurité de tout le système."},
es:{title:"Fundamentos de los gestores de contraseñas: qué buscar",text:"Por qué reutilizar contraseñas es riesgoso y cómo lo resuelve un gestor de contraseñas.",body:"Reutilizar la misma contraseña en varios sitios significa que una sola filtración de datos puede exponer todas las cuentas que usan esa contraseña. Un gestor de contraseñas genera y almacena automáticamente una contraseña única y fuerte para cada cuenta.\\n\\nAl elegir un gestor de contraseñas, busca cifrado fuerte, sincronización entre dispositivos y una política clara sobre qué pasa con tus datos si la empresa es adquirida o cierra. Una contraseña maestra local que solo tú conoces sigue siendo la base de la seguridad de todo el sistema."}
}
}'''

marker = "\n];"
idx = s.find(marker)
if idx == -1:
    raise SystemExit("ERROR: could not find end of articles array")

# Find the position of the last "}" before "\n];" to insert after it
s = s[:idx] + new_articles + s[idx:]

p.write_text(s)
print("✓ 12 new professional articles added to app.js")
PY

echo
echo "========== VALIDATION =========="
node -c assets/app.js 2>/dev/null && echo "✓ app.js syntax OK" || echo "⚠ node not available or syntax error — check manually"
grep -c '"id":"' assets/app.js 2>/dev/null || grep -c "id:\"" assets/app.js

echo
echo "========== GIT =========="
git add .
git status --short
git commit -m "Add 12 professional multilingual articles" || true
git push origin main

echo
echo "========== DONE =========="
echo "https://aspirinegamed-beep.github.io/teknik-platform/"
echo
echo "curl -sS -o /dev/null -w 'HTTP: %{http_code}\n' https://aspirinegamed-beep.github.io/teknik-platform/"
