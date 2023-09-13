const {Database,aql} = require("arangojs");


const db = new Database({
  url: "http://localhost:8529",
  databaseName: "mydb",
  auth: {
    username: "root",
    password: ""
  },
})

const getCollection = async (cName) => {

    // get list of collections in database
    const collections = await db.collections();
  
    // check if collection exists, if so return collection, if not, create it
    if (collections.find((c) => c._name === cName)) {
      return await db.collection(cName);
    } else {
      return db.createCollection(cName);
    }
  };
  



export async function arangoDBAdapter() {


    await getCollection("Users")
    await getCollection("Accounts")
    await getCollection("Sessions")
    await getCollection("VerificationTokens")



    return {
      async createUser(user) {
        try {
         
          await db.query(aql `INSERT {${user}} IN Users`);
         
          return user
        } catch (error) {
         console.log(error) 
        }
      },
      async getUser(id) {
try {
  
const user = await db.query(aql `FOR u in Users  FILTER ${id} == u._id RETURN { u }`);

  if (!user){return null;}

     return (user[0]);
} catch (error) {
  console.log(error) 
}

        
      },
      async getUserByEmail(email) {

        console.log(email)
        try {
  
          const user = await db.query(aql `FOR u in Users  FILTER ${email} == u.email RETURN { u }`);
          
            if (!user){return null;}
          
               return (user[0]);
          } catch (error) {
            console.log(error) 
          }
        
      },
      async getUserByAccount({ provider, id }) {

        try {
  
          const account = await db.query(aql `FOR u in Accounts FILTER ${id} == ${"u."+provider} RETURN { u }`);
          
          if (!account) {return null;}

          const user = await this.getUser(account[0].userId);

          if (!user){return null;}

          return from(user);

          } catch (error) {
            console.log(error) 
          }
       
      },
      async updateUser(data) {

       try {

        const user = await db.query(aql `FOR u IN UserCollection  FILTER u._id == ${data.id} UPDATE u WITH {${data}} IN UserCollection`);
        return from(user);

         
       } catch (error) {
        console.log(error)
       }
      
        

      },
      async deleteUser(userId) {
        try {
          
        } catch (error) {
          console.log(error) 
        }
         await db.query(aql `FOR u IN Users FILTER u._is == ${userId} REMOVE u IN Users`);
         await db.query(aql `FOR u IN Accounts FILTER userId == ${userId} REMOVE u IN Accounts`);
         await db.query(aql `FOR u IN Sessions FILTER userId == ${userId} REMOVE u IN Sessions`);
      },
      async linkAccount(account) {
        try {
         
          await db.query(aql `INSERT {${account}} IN Users`);
         
          return account
        } catch (error) {
         console.log(error) 
        }
      },
      async unlinkAccount({ provider, id }) {
        try {
          const account = await db.query(aql `FOR u in Accounts FILTER ${id} == ${"u."+provider} REMOVE u IN Accounts RETURN { u }`);
          return account;
        } catch (error) {
          console.log(error)
        }
      },
      async createSession(data) {
        try {
         
          await db.query(aql`INSERT {${data}} IN Sessions`);
         
          return data
        } catch (error) {
         console.log(error) 
        }
      },
      async getSessionAndUser(sessionToken) {
        try {
  
          const account = await db.query(aql `FOR u in Sessions FILTER ${sessionToken} == u.id RETURN { u }`);
          
          if (!account) {return null;}

          const user = await this.getUser(account[0].userId);

          if (!user){return null;}

          return user;

          } catch (error) {
            console.log(error) 
          }
      },
      async updateSession(data) {
        try {

          const Session = await db.query(aql `FOR u IN Sessions  FILTER u.sessionToken == ${data.sessionToken} UPDATE u WITH {${data}} IN Sessions`);
          return Session;
  
           
         } catch (error) {
          console.log(error)
         }
      },
      async deleteSession(sessionToken) {
        try {
          const Session = await db.query(aql `FOR u in Sessions FILTER ${sessionToken} == u.sessionToken REMOVE u IN Sessions RETURN { u }`);
          return Session;
        } catch (error) {
          console.log(error)
        }

        
      },
      async createVerificationToken(data) {
        try {
         
          await db.query(aql `INSERT {${data}} IN VerificationTokens`);
         
          return data
        } catch (error) {
         console.log(error) 
        }


      },
      async useVerificationToken({ identifier, token }) {
        
        try {
          const VerificationToken = await db.query(aql `FOR u in Sessions FILTER ${token} == u.token REMOVE u IN Sessions RETURN { u }`);
          if (!VerificationToken){return null;}
        } catch (error) {
          console.log(error)
        }
      },
    }
  }