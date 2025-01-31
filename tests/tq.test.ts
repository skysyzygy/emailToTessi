import { test, expect, vi, describe, beforeEach, afterAll, beforeAll } from 'vitest'
import { lowercaseKeys, tq } from '$lib/tq'
import { env } from '$env/dynamic/private'
var dev_server = JSON.parse(env.DEV_SERVER)


describe("lowercaseKeys", () => {
    let o = {"An":1,"oBjEcT":"A","CAN":[1,2,3],"BE!":true} as Record<string,any>
    let l = {"an":1,"object":"A","can":[1,2,3],"be!":true} as Record<string,any>

    test("lowercaseKeys works with basic objects", () => {
        expect(lowercaseKeys(o)).toEqual(l)
    })

    test("lowercaseKeys works with arrays", () => {
        expect(lowercaseKeys([o,o,o])).toEqual([l,l,l])
    })

    test("lowercaseKeys works with nested object", () => {
        o["Nested?"] = structuredClone(o)
        l["nested?"] = structuredClone(l)
        expect(lowercaseKeys(o)).toEqual(l)
    })

    test("lowercaseKeys works with nested array", () => {
        let p = {"Nested!":[structuredClone(o),structuredClone(l)]}
        expect((lowercaseKeys(p) as any)["nested!"][0]).toEqual(lowercaseKeys(o))
        expect((lowercaseKeys(p) as any)["nested!"][1]).toEqual(lowercaseKeys(l))
    })
})



describe("tq", () => {
    
    test("tq runs the tq executable", async () => {
        expect(await tq("","")).toMatch("tq is a wrapper around")
    })

    test("tq has access to the Azure auth backend", async () => {
        expect(await tq("auth","list")).toMatch(env.TQ_ADMIN_LOGIN || "The TQ_ADMIN_LOGIN variable isn't defined!")
    })

    test("tq returns an object (vpn)", {timeout: 10000}, async () => {
        if (!env.TQ_ADMIN_PASSWORD)
            throw("Define an admin password in env")
        await tq("auth","add",{query: env.TQ_ADMIN_PASSWORD, login: dev_server[0].value + "|" + env.TQ_ADMIN_LOGIN})
        let constituent = await tq("get","constituents",{query: {constituentid: "1"}, login: dev_server[0].value + "|" + env.TQ_ADMIN_LOGIN})
        expect(constituent).toHaveProperty("id")
        expect(constituent).toHaveProperty("displayname")
        expect(constituent).toHaveProperty("lastname")
    })

    test("tq returns an object (relay)", async () => {
        if (!env.TQ_ADMIN_PASSWORD)
            throw("Define an admin password in env")
        await tq("auth","add",{query: env.TQ_ADMIN_PASSWORD, login: dev_server[1].value + "|" + env.TQ_ADMIN_LOGIN})
        let constituent = await tq("get","constituents",{query: {constituentid: "1"}, login: dev_server[1].value + "|" + env.TQ_ADMIN_LOGIN})
        expect(constituent).toHaveProperty("id")
        expect(constituent).toHaveProperty("displayname")
        expect(constituent).toHaveProperty("lastname")
    })
})